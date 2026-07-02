"use client";

import { useState } from "react";
// 1. Importamos toast
import toast from "react-hot-toast";

export default function BotonAgregar({ libroId }: { libroId: number }) {
  const [cargando, setCargando] = useState(false);

  const agregarAlCarrito = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Usamos un toast de error en lugar de alert
      toast.error("Por favor, inicia sesión para agregar productos.");
      return;
    }

    setCargando(true);

    // Opcional: mostrar un toast de "cargando" mientras espera a la base de datos
    const toastId = toast.loading("Agregando al carrito...");

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/carrito", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ LibroID: libroId, Cantidad: 1 }), 
      });

      if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.detail || "Error al agregar el producto");
      }

      // Si todo sale bien, cambiamos el toast de carga por uno de éxito
      toast.success("¡Producto agregado con éxito!", {
        id: toastId,
      });

    } catch (error: any) {
      // Si falla, mostramos el error
      toast.error(error.message, {
        id: toastId,
      });
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