"use client";

import { useState } from "react";

// Definimos que el componente espera recibir el ID del libro
export default function BotonAgregar({ libroId }: { libroId: number }) {
  const [cargando, setCargando] = useState(false);

  const agregarAlCarrito = async () => {
    // 1. Buscamos el token de seguridad
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Por favor, inicia sesión para agregar productos al carrito.");
      return;
    }

    setCargando(true);

    try {
      // 2. Enviamos la petición a FastAPI, inyectando el token en los Headers
      const respuesta = await fetch("http://127.0.0.1:8000/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Así es como enviamos la llave maestra al backend:
          "Authorization": `Bearer ${token}` 
        },
        // Enviamos el ID del libro y asumimos que agrega 1 por defecto
        body: JSON.stringify({ LibroID: libroId, Cantidad: 1 }), 
      });

      if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.detail || "Error al agregar el producto");
      }

      alert("¡Producto agregado al carrito con éxito!");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button 
      onClick={agregarAlCarrito}
      disabled={cargando}
      className="w-full mt-4 bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition disabled:bg-gray-400"
    >
      {cargando ? "Agregando..." : "Agregar al Carrito"}
    </button>
  );
}