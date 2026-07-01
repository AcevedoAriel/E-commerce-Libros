from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

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

# Le decimos a FastAPI cuál es la ruta donde el usuario consigue su token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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

# --- NUEVA FUNCIÓN PARA PROTEGER RUTAS ---
# Esta función intercepta la petición, lee el token y extrae al usuario
def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    try:
        # Intentamos decodificar el token con nuestra clave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        
        if correo is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="No se pudo validar las credenciales"
            )
        
        # Si todo sale bien, devolvemos los datos del usuario que estaban dentro del token
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="El token ha expirado. Por favor, inicia sesión nuevamente."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token inválido."
        )