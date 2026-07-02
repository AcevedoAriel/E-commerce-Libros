from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas # <-- Agregamos schemas
from database import engine, get_db
from typing import List # <-- Para tipar listas de datos
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from security import obtener_hash_password, verificar_password, crear_token_acceso, obtener_usuario_actual
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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
    datos: dict, # Asumiendo que recibes un JSON con LibroID y Cantidad
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")
    libro_id = datos.get("LibroID")
    cantidad_a_agregar = datos.get("Cantidad", 1)

    # 1. Buscamos si el libro existe y tiene stock
    libro = db.query(models.Libro).filter(models.Libro.LibroID == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")

    # 2. Buscamos si el usuario ya tiene una orden 'Pendiente' (su carrito activo)
    orden = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id,
        models.Orden.Estado == 'Pendiente'
    ).first()

    # Si no tiene orden, se la creamos
    if not orden:
        orden = models.Orden(UsuarioID=usuario_id, Total=0, Estado='Pendiente')
        db.add(orden)
        db.commit()
        db.refresh(orden)

    # 3. LÓGICA DE AGRUPACIÓN: Buscamos si ese libro ya está en el detalle de la orden
    detalle_existente = db.query(models.DetalleOrden).filter(
        models.DetalleOrden.OrdenID == orden.OrdenID,
        models.DetalleOrden.LibroID == libro_id
    ).first()

    if detalle_existente:
        # Si ya existe en el carrito, verificamos que el stock alcance para sumar la nueva cantidad
        nueva_cantidad_total = detalle_existente.Cantidad + cantidad_a_agregar
        if libro.Stock < nueva_cantidad_total:
            raise HTTPException(status_code=400, detail="No hay suficiente stock para agregar más unidades de este libro")
        
        # Le sumamos la cantidad a la fila que ya existe
        detalle_existente.Cantidad = nueva_cantidad_total
    else:
        # Si no existe en el carrito, verificamos el stock y creamos una fila nueva
        if libro.Stock < cantidad_a_agregar:
            raise HTTPException(status_code=400, detail="Stock insuficiente")
            
        nuevo_detalle = models.DetalleOrden(
            OrdenID=orden.OrdenID,
            LibroID=libro_id,
            Cantidad=cantidad_a_agregar,
            PrecioUnitario=libro.Precio
        )
        db.add(nuevo_detalle)

    db.commit()

    # 4. Recalculamos el total a pagar de la orden
    todos_los_detalles = db.query(models.DetalleOrden).filter(models.DetalleOrden.OrdenID == orden.OrdenID).all()
    orden.Total = sum([d.Cantidad * d.PrecioUnitario for d in todos_los_detalles])
    db.commit()

    return {"mensaje": "Producto agregado al carrito con éxito"}

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

# --- ENDPOINT PARA VER EL CARRITO ---
@app.get("/carrito")
def ver_carrito(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")

    # Buscamos si hay una orden pendiente
    orden = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id,
        models.Orden.Estado == 'Pendiente'
    ).first()

    # Si no hay orden, devolvemos un carrito vacío
    if not orden:
        return {"Total": 0, "detalles": []}

    # Si hay orden, buscamos los detalles y los cruzamos con los libros para tener el título
    detalles = db.query(models.DetalleOrden).filter(models.DetalleOrden.OrdenID == orden.OrdenID).all()
    
    items_carrito = []
    for item in detalles:
        libro = db.query(models.Libro).filter(models.Libro.LibroID == item.LibroID).first()
        if libro:
            items_carrito.append({
                "DetalleID": item.DetalleID,
                "Titulo": libro.Titulo,
                "Cantidad": item.Cantidad,
                "PrecioUnitario": item.PrecioUnitario,
                "Subtotal": item.Cantidad * item.PrecioUnitario
            })

    return {"Total": orden.Total, "detalles": items_carrito}

# Esquema para recibir la nueva cantidad
class NuevaCantidad(BaseModel):
    Cantidad: int

# --- ENDPOINT PARA VACIAR TODO EL CARRITO ---
@app.delete("/carrito")
def vaciar_carrito(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")
    # Buscamos la orden pendiente del usuario
    orden = db.query(models.Orden).filter(
        models.Orden.UsuarioID == usuario_id, 
        models.Orden.Estado == 'Pendiente'
    ).first()
    
    if orden:
        # Borramos todos los detalles asociados a esa orden
        db.query(models.DetalleOrden).filter(models.DetalleOrden.OrdenID == orden.OrdenID).delete()
        orden.Total = 0
        db.commit()
        
    return {"mensaje": "Carrito vaciado exitosamente"}

# --- ENDPOINT PARA CAMBIAR LA CANTIDAD DE UN LIBRO (+ / -) ---
@app.put("/carrito/{detalle_id}")
def actualizar_cantidad(
    detalle_id: int, 
    datos: NuevaCantidad, 
    db: Session = Depends(get_db), 
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")
    
    # Buscamos el detalle específico que queremos modificar
    detalle = db.query(models.DetalleOrden).filter(models.DetalleOrden.DetalleID == detalle_id).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
        
    orden = db.query(models.Orden).filter(models.Orden.OrdenID == detalle.OrdenID).first()

    # Lógica central: si la cantidad llega a 0, eliminamos el libro del carrito
    if datos.Cantidad <= 0:
        db.delete(detalle)
    else:
        detalle.Cantidad = datos.Cantidad
        
    db.commit()
    
    # Recalculamos el total a pagar de la orden cruzando con el Precio Unitario
    detalles_restantes = db.query(models.DetalleOrden).filter(models.DetalleOrden.OrdenID == orden.OrdenID).all()
    orden.Total = sum([d.Cantidad * d.PrecioUnitario for d in detalles_restantes])
    db.commit()
    
    return {"mensaje": "Cantidad actualizada correctamente"}

# --- ENDPOINT PARA OBTENER DATOS DEL USUARIO LOGUEADO ---
@app.get("/usuarios/me")
def obtener_perfil(
    db: Session = Depends(get_db),
    usuario_actual: dict = Depends(obtener_usuario_actual)
):
    usuario_id = usuario_actual.get("id")
    
    # Buscamos el usuario en la base de datos usando el ID del token
    usuario = db.query(models.Usuario).filter(models.Usuario.UsuarioID == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Lógica condicional: Si EsAdmin es 1 (Verdadero), asignamos "Administrador". Si es 0 (Falso), "Cliente".
    rol_usuario = "Administrador" if usuario.EsAdmin else "Cliente"
        
    return {
        "Nombre": usuario.Nombre, 
        "Rol": rol_usuario
    }