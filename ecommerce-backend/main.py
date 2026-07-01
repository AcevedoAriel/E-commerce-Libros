from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas # <-- Agregamos schemas
from database import engine, get_db
from typing import List # <-- Para tipar listas de datos
from fastapi import FastAPI, Depends, HTTPException
from security import obtener_hash_password

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce Libros API")

@app.get("/")
def read_root():
    return {"mensaje": "¡El servidor del e-commerce está funcionando correctamente!"}

# --- MEJORAMOS EL GET ---
# Con response_model aseguramos que la salida cumple con nuestro esquema
@app.get("/libros", response_model=List[schemas.Libro])
def obtener_libros(db: Session = Depends(get_db)):
    libros = db.query(models.Libro).all()
    return libros

# --- NUEVO ENDPOINT POST ---
@app.post("/libros", response_model=schemas.Libro)
def crear_libro(libro: schemas.LibroCreate, db: Session = Depends(get_db)):
    # Convertimos los datos validados de Pydantic al modelo de SQLAlchemy
    nuevo_libro = models.Libro(**libro.model_dump())
    
    # Lo agregamos a la sesión y hacemos commit (como en SQL)
    db.add(nuevo_libro)
    db.commit()
    
    # Refrescamos para obtener el LibroID generado por la base de datos
    db.refresh(nuevo_libro) 
    return nuevo_libro

# --- ENDPOINT PUT (Actualizar) ---
@app.put("/libros/{libro_id}", response_model=schemas.Libro)
def actualizar_libro(libro_id: int, libro_actualizado: schemas.LibroCreate, db: Session = Depends(get_db)):
    # 1. Buscamos el libro (Equivalente a SELECT ... WHERE LibroID = libro_id)
    libro = db.query(models.Libro).filter(models.Libro.LibroID == libro_id).first()
    
    # Si no existe, devolvemos error 404
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    
    # 2. Actualizamos los valores iterando sobre los datos recibidos
    for key, value in libro_actualizado.model_dump().items():
        setattr(libro, key, value)
        
    # 3. Guardamos los cambios
    db.commit()
    db.refresh(libro)
    return libro

# --- ENDPOINT DELETE (Eliminar) ---
@app.delete("/libros/{libro_id}")
def eliminar_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(models.Libro).filter(models.Libro.LibroID == libro_id).first()
    
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
        
    # 2. Eliminamos el registro
    db.delete(libro)
    db.commit()
    
    return {"mensaje": f"El libro con ID {libro_id} fue eliminado correctamente"}

# --- ENDPOINT DE REGISTRO DE USUARIOS ---
@app.post("/registro", response_model=schemas.UsuarioResponse)
def registrar_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el email ya existe en la base de datos
    usuario_existente = db.query(models.Usuario).filter(models.Usuario.Correo == usuario.Correo).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # 2. Encriptar la contraseña recibida
    password_encriptada = obtener_hash_password(usuario.Password)
    
    # 3. Crear el registro para la base de datos (Nota: Guardamos el PasswordHash, no el Password)
    nuevo_usuario = models.Usuario(
        Nombre=usuario.Nombre,
        Correo=usuario.Correo,
        PasswordHash=password_encriptada
    )
    
    # 4. Guardar los cambios
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario