"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ItemCarrito {
  DetalleID: number;
  Titulo: string;
  Cantidad: number;
  PrecioUnitario: number;
  Subtotal: number;
}

interface CarritoData {
  Total: number;
  detalles: ItemCarrito[];
}

export default function Carrito() {
  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // 1. Definimos la función de cargar el carrito DENTRO del componente
  const cargarCarrito = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/carrito", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error("Error al cargar el carrito");
      }

      const datos = await respuesta.json();
      setCarrito(datos);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 2. Definimos la función de pago también DENTRO del componente, 
  // así puede acceder a cargarCarrito() sin problemas
  const procesarPago = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/carrito/checkout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        const errorDatos = await respuesta.json();
        throw new Error(errorDatos.detail || "Error al procesar el pago");
      }

      alert("¡Compra finalizada con éxito! El stock ha sido actualizado.");
      
      // Como ahora sí la encuentra, recargará el carrito y se limpiará la pantalla
      cargarCarrito();

    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Mi Carrito de Compras</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!carrito || carrito.detalles.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600 text-lg">Tu carrito está vacío.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver al catálogo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Libro</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrito.detalles.map((item) => (
                <tr key={item.DetalleID} className="border-b">
                  <td className="p-4 font-medium">{item.Titulo}</td>
                  <td className="p-4">{item.Cantidad}</td>
                  <td className="p-4">${item.PrecioUnitario}</td>
                  <td className="p-4 font-semibold">${item.Subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-6 bg-gray-50 flex justify-between items-center border-t">
            <span className="text-xl">Total a pagar:</span>
            <span className="text-2xl font-bold text-green-600">${carrito.Total}</span>
          </div>

          <div className="p-4 flex justify-end">
            <button 
              onClick={procesarPago}
              className="bg-green-600 text-white px-6 py-3 rounded text-lg font-bold hover:bg-green-700 transition"
            >
              Proceder al Pago
            </button>
          </div>
        </div>
      )}
    </main>
  );
}