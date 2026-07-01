from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Propiedades comunes que usaremos al crear o leer un libro
class LibroBase(BaseModel):
    Titulo: str
    Autor: str
    Descripcion: Optional[str] = None
    Precio: float
    Stock: int = 0
    ImagenURL: Optional[str] = None
    CategoriaID: int

# Esquema para cuando recibimos datos para crear un libro (POST)
class LibroCreate(LibroBase):
    pass

# Esquema para cuando devolvemos un libro al cliente (GET)
class Libro(LibroBase):
    LibroID: int

    # Esta configuración permite que Pydantic lea directamente los objetos de SQLAlchemy
    class Config:
        from_attributes = True

# Esquema para registrar un nuevo usuario
class UsuarioCreate(BaseModel):
    Nombre: str
    Correo: str
    Password: str # El usuario envía su contraseña limpia, nosotros la encriptamos antes de guardarla

# Esquema para responderle al cliente (Ocultamos el PasswordHash por seguridad)
class UsuarioResponse(BaseModel):
    UsuarioID: int
    Nombre: str
    Correo: str
    EsAdmin: int

    class Config:
        from_attributes = True


# Esquema para iniciar sesión
class UsuarioLogin(BaseModel):
    Correo: str
    Password: str

# Esquema para agregar un producto al carrito
class ItemCarrito(BaseModel):
    LibroID: int
    Cantidad: int

# Esquema para mostrar el historial de órdenes
class OrdenResponse(BaseModel):
    OrdenID: int
    UsuarioID: int
    FechaOrden: datetime
    Total: float
    Estado: str

    class Config:
        from_attributes = True