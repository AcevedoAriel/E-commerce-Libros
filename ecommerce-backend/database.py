from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Reemplaza 'TU_SERVIDOR' y 'NOMBRE_TU_BD' con los datos de tu SQL Server local.
# Si usas autenticación de Windows, el string se ve así:
#SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://@ArielAcevedo\SQLEXPRESS/Libros?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"

# Si usas usuario (sa) y contraseña:
SQLALCHEMY_DATABASE_URL = r"mssql+pyodbc://ariel_admin:453433@ArielAcevedo\SQLEXPRESS/Libros?driver=ODBC+Driver+17+for+SQL+Server"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para inyectar la sesión de base de datos en nuestras rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()