from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

# Configuramos passlib para que use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Función para encriptar la contraseña antes de guardarla
def obtener_hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Función para comparar la contraseña plana que ingresa el usuario en el login con el hash guardado
def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CONFIGURACIÓN JWT ---
# En un proyecto real, esta clave va en un archivo oculto (.env). Por ahora la dejamos aquí.
SECRET_KEY = "mi_clave_secreta_super_segura_para_el_ecommerce" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # El token durará 1 hora

def obtener_hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- NUEVA FUNCIÓN PARA CREAR EL TOKEN ---
def crear_token_acceso(data: dict):
    to_encode = data.copy()
    
    # Definimos cuándo expira el token
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Firmamos el token con nuestra palabra secreta
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt