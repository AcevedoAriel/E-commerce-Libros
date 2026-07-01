from sqlalchemy import Column, Integer, String, Float, DateTime
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