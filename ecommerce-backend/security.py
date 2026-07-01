from passlib.context import CryptContext

# Configuramos passlib para que use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Función para encriptar la contraseña antes de guardarla
def obtener_hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Función para comparar la contraseña plana que ingresa el usuario en el login con el hash guardado
def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)