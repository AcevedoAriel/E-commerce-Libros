from sqlalchemy import Column, Integer, String, Float
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