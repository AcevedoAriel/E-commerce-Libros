from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from datetime import datetime, timezone
from database import Base

class Libro(Base):
    __tablename__ = "Libros" # Debe coincidir exactamente con la tabla en SQL Server

    LibroID = Column(Integer, primary_key=True, index=True)
    Titulo = Column(String(200), nullable=False)
    Autor = Column(String(150), nullable=False)
    Descripcion = Column(String)
    Precio = Column(Float, nullable=False)
    Stock = Column(Integer, nullable=False, default=0)
    ImagenURL = Column(String(500))
    CategoriaID = Column(Integer)

class Usuario(Base):
    __tablename__ = "Usuarios"

    UsuarioID = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(100), nullable=False)
    Correo = Column(String(150), unique=True, nullable=False, index=True)
    PasswordHash = Column(String(256), nullable=False)
    FechaRegistro = Column(DateTime)
    EsAdmin = Column(Integer, default=0) # Usamos Integer porque SQL Server mapea BIT como 0 o 1

class Orden(Base):
    __tablename__ = "Ordenes"
    OrdenID = Column(Integer, primary_key=True, index=True)
    UsuarioID = Column(Integer, ForeignKey("Usuarios.UsuarioID"), nullable=False)
    FechaOrden = Column(DateTime, default=datetime.utcnow)
    Total = Column(Float, nullable=False, default=0.0)
    Estado = Column(String(20), default='Pendiente')

class DetalleOrden(Base):
    __tablename__ = "DetalleOrdenes"

    DetalleID = Column(Integer, primary_key=True, index=True)
    OrdenID = Column(Integer, ForeignKey("Ordenes.OrdenID"), nullable=False)
    LibroID = Column(Integer, ForeignKey("Libros.LibroID"), nullable=False)
    Cantidad = Column(Integer, nullable=False)
    PrecioUnitario = Column(Float, nullable=False)