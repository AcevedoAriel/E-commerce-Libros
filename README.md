# 📚 E-commerce de Libros

Una plataforma web completa de comercio electrónico para la venta de libros, desarrollada con una arquitectura Full-Stack moderna. Este proyecto incluye gestión de usuarios, catálogo dinámico, carrito de compras interactivo y procesamiento de órdenes con control de stock transaccional en tiempo real.

## ✨ Características Principales

* **Catálogo de Productos:** Visualización de libros con imágenes, precios y stock actualizado en tiempo real gracias al Server-Side Rendering (SSR).
* **Autenticación y Seguridad:** Sistema de Login/Registro seguro utilizando tokens JWT y encriptación de contraseñas.
* **Carrito de Compras Inteligente:**
  * Agrupación automática de productos iguales.
  * Modificación de cantidades (+ y -) interactiva.
  * Opción para vaciar el carrito completo con confirmación mediante un Modal personalizado.
  * Cálculo dinámico de subtotales y total a pagar.
* **Checkout y Órdenes:** Procesamiento de compras que descuenta automáticamente el inventario de la base de datos.
* **Historial de Compras:** Panel privado donde cada usuario puede visualizar sus transacciones pasadas ordenadas por fecha.
* **Diseño Responsive:** Interfaz moderna y adaptable a cualquier dispositivo (Mobile-First) utilizando Tailwind CSS, con menú de navegación tipo hamburguesa para celulares.

## 🛠️ Tecnologías Utilizadas

**Frontend:**
* [Next.js](https://nextjs.org/) (Framework de React - App Router)
* [Tailwind CSS](https://tailwindcss.com/) (Framework de utilidades CSS)
* `react-hot-toast` (Notificaciones emergentes)

**Backend:**
* [Python](https://www.python.org/)
* [FastAPI](https://fastapi.tiangolo.com/) (Framework web moderno y rápido para construir APIs)
* **Seguridad:** JWT (JSON Web Tokens) y Passlib/Bcrypt para hashing.

**Base de Datos:**
* Microsoft SQL Server (Diseño de modelo relacional)

## 📂 Estructura del Proyecto

El repositorio está dividido en tres directorios principales que separan la lógica de negocio, la interfaz y los datos:
* `/ecommerce-frontend`: Aplicación cliente.
* `/ecommerce-backend`: API RESTful conectada a la base de datos.
* `/sql`: Entorno de base de datos.

## 🚀 Cómo ejecutar el proyecto localmente

### 1. Base de Datos (SQL Server)
Asegúrate de tener tu motor de SQL Server corriendo con las tablas creadas (`Usuarios`, `Libros`, `Ordenes`, `DetalleOrdenes`) y las credenciales correctamente configuradas en el archivo de conexión de Python.

### 2. Backend (FastAPI)
Abre una terminal, navega a la carpeta del backend y ejecuta:
```bash
cd ecommerce-backend
# Activa tu entorno virtual (si utilizas uno)
# venv\Scripts\activate

# Ejecuta el servidor
uvicorn main:app --reload


El servidor estará corriendo en http://127.0.0.1:8000

3. Frontend (Next.js)
Abre otra pestaña en tu terminal, navega a la carpeta del frontend y ejecuta:

cd ecommerce-frontend
# Instala las dependencias de Node
npm install

# Ejecuta el servidor de desarrollo
npm run dev

La aplicación estará disponible en http://localhost:3000
