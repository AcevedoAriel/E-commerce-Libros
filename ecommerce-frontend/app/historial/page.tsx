"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Estructura de la orden según tu backend en Python
interface Orden {
  OrdenID: number;
  FechaOrden: string; 
  Total: number;
  Estado: string;
}

export default function Historial() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cargarHistorial = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const respuesta = await fetch("http://127.0.0.1:8000/ordenes/historial", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!respuesta.ok) {
          throw new Error("Error al cargar el historial");
        }

        const datos = await respuesta.json();
        setOrdenes(datos);
      } catch (err: any) {
        setError(err.message);
      }
    };

    cargarHistorial();
  }, [router]);

  // Función para transformar la fecha que envía la base de datos a un formato legible
  const formatearFecha = (fechaIso: string) => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main className="p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Mi Historial de Compras</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {ordenes.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600 text-lg">Aún no has realizado ninguna compra.</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir al catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ordenes.map((orden) => (
            <div key={orden.OrdenID} className="bg-white p-6 rounded shadow border-l-4 border-green-500">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div>
                  <span className="text-sm text-gray-500 block">Orden #{orden.OrdenID}</span>
                  <span className="font-semibold">{formatearFecha(orden.FechaOrden)}</span>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded uppercase font-bold tracking-wide">
                    {orden.Estado}
                  </span>
                  <span className="block text-xl font-bold text-gray-800 mt-1">${orden.Total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}