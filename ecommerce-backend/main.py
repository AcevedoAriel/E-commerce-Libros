from fastapi import FastAPI

app = FastAPI(
    title="E-commerce Libros API",
    description="API para la gestión de la tienda de libros",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"mensaje": "¡El servidor del e-commerce está funcionando correctamente!"}