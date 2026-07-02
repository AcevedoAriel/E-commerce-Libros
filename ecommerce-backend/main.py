from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas # <-- Agregamos schemas
from database import engine, get_db
from typing import List # <-- Para tipar listas de datos
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from security import obtener_hash_password, verificar_password, crear_token_acceso, obtener_usuario_actual
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce Libros API")

# Permitir que el frontend de Next.js se conecte sin bloqueos de seguridad
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # El puerto de tu frontend
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "¡El servidor del e-commerce está funcionando correctamente!"}

# --- MEJORAMOS EL GET ---
# Con response_model aseguramos que la salida cumple con nuestro esquema
@app.get("/libros", response_model=List[schemas.Libro])
def obtener_libros(db: Session = Depends(get_db)):
    libros = db.query(models.Libro).all()
    return libros

# --- ENDPOINT POST (Protegido) ---
@app.post("/libros", response_model=schemas.Libro)
def crear_libro(
    libro: schemas.LibroCreate, 
    db: Session = Depends(get_db),
    # Al agregar esta línea, FastAPI exige un token válido para ejecutar la función
    usuario_actual: dict = Depends(obtener_usuario_actual) 
):
    # Validamos que el usuario tenga rol de Administrador (EsAdmin = 1)
    if usuario_actual.get("es_admin") != 1:
        raise HTTPException(
            status_code=403, 
            detail="No tienes permisos suficientes para realizar esta acción. Solo administradores."
        )

    # Si pasó la validación, creamos el libro normalmente
    nuevo_libro = models.Libro(**libro.model_dump())
    db.add(nuevo_libro)
    db.commit()
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

# --- ENDPOINT DE LOGIN ---
# --- ENDPOINT DE LOGIN (ADAPTADO A SWAGGER) ---
@app.post("/login")
def login(credenciales: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Buscamos al usuario usando .username (que es el mail que mandás en el formulario)
    usuario = db.query(models.Usuario).filter(models.Usuario.Correo == credenciales.username).first()
    
    # Si no existe el usuario, lanzamos error
    if not usuario:
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")
    
    # 2. Verificamos la contraseña usando .password del formulario
    if not verificar_password(credenciales.password, usuario.PasswordHash):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos")
    
    # 3. Si todo está bien, creamos el token
    datos_token = {
        "sub": usuario.Correo,
        "id": usuario.UsuarioID,
        "es_admin": usuario.EsAdmin
    }
    token = crear_token_acceso(data=datos_token)
    
    # Devolvemos el token al cliente
    return {"access_token": token, "token_type": "bearer"}

# --- ENDPOINT PARA AGREGAR AL CARRITO ---
@app.post("/carrito")
def agregar_al_carrito(
    item: schemas.ItemCarrito, 
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual) # Requerimos token válido
):
    usuario_id = usuario_actual.get("id")

    # 1. Buscar si el usuario ya tiene una orden "Pendiente" (su carrito activo)
    orden = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id,
        models.Orden.Estado == 'Pendiente'
    ).first()

    # Si no tiene carrito activo, le creamos uno nuevo
    if not orden:
        orden = models.Orden(UsuarioID=usuario_id, Total=0.0, Estado='Pendiente')
        db.add(orden)
        db.commit()
        db.refresh(orden)

    # 2. Buscar el libro para verificar precio y stock
    libro = db.query(models.Libro).filter(models.Libro.LibroID == item.LibroID).first()
    
    if not libro:
        raise HTTPException(status_code=404, detail="El libro no existe")
        
    if libro.Stock < item.Cantidad:
        raise HTTPException(status_code=400, detail=f"Stock insuficiente. Solo quedan {libro.Stock} unidades.")

    # 3. Agregar el ítem al detalle de la orden
    nuevo_detalle = models.DetalleOrden(
        OrdenID=orden.OrdenID,
        LibroID=item.LibroID,
        Cantidad=item.Cantidad,
        PrecioUnitario=libro.Precio # Guardamos el precio actual del libro
    )
    db.add(nuevo_detalle)

    # 4. Actualizar el total de la cabecera de la Orden
    orden.Total += (libro.Precio * item.Cantidad)
    
    # Guardamos toda la transacción
    db.commit()

    return {"mensaje": "Producto agregado al carrito exitosamente", "orden_id": orden.OrdenID, "total_actual": orden.Total}

# --- ENDPOINT PARA FINALIZAR LA COMPRA (CHECKOUT) ---
@app.post("/carrito/checkout")
def finalizar_compra(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")

    # 1. Buscar la orden "Pendiente" del usuario (su carrito actual)
    orden = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id,
        models.Orden.Estado == 'Pendiente'
    ).first()

    if not orden:
        raise HTTPException(status_code=400, detail="No tienes un carrito activo para procesar.")

    # 2. Obtener todos los ítems agregados a este carrito
    detalles = db.query(models.DetalleOrden).filter(models.DetalleOrden.OrdenID == orden.OrdenID).all()
    
    if not detalles:
        raise HTTPException(status_code=400, detail="El carrito está vacío.")

    # 3. Validar stock y descontar unidades
    # Iteramos por cada artículo del detalle para asegurar la integridad de los datos
    for item in detalles:
        libro = db.query(models.Libro).filter(models.Libro.LibroID == item.LibroID).first()
        
        if not libro:
            raise HTTPException(status_code=404, detail=f"El libro con ID {item.LibroID} ya no existe.")
            
        if libro.Stock < item.Cantidad:
            raise HTTPException(
                status_code=400, 
                detail=f"Error de stock de último momento: '{libro.Titulo}' solo tiene {libro.Stock} unidades disponibles."
            )
        
        # Manipulación y actualización de datos: restamos el stock real
        libro.Stock -= item.Cantidad

    # 4. Cambiar el estado de la orden a 'Pagado'
    orden.Estado = 'Pagado'
    
    # Confirmamos la transacción completa en la base de datos
    db.commit()

    return {
        "mensaje": "¡Compra finalizada con éxito!",
        "orden_id": orden.OrdenID,
        "total_pagado": orden.Total,
        "estado": orden.Estado
    }

# --- ENDPOINT PARA VER EL HISTORIAL DE COMPRAS ---
@app.get("/ordenes/historial", response_model=List[schemas.OrdenResponse])
def obtener_historial_ordenes(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    # Extraemos el ID del usuario autenticado desde el token
    usuario_id = usuario_actual.get("id")

    # Ejecutamos la consulta filtrando por el UsuarioID y el Estado 'Pagado'
    # Equivalente a: SELECT * FROM Ordenes WHERE UsuarioID = id AND Estado = 'Pagado'
    historial = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id,
        models.Orden.Estado == 'Pagado'
    ).order_by(models.Orden.FechaOrden.desc()).all() # Las ordenamos de la más reciente a la más vieja

    return historial