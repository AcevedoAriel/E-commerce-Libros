"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  
  // NUEVO: Separamos los controles de las ventanas emergentes
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState(false);
  
  const router = useRouter();

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

  const cambiarCantidad = async (detalleId: number, nuevaCantidad: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const toastId = toast.loading("Actualizando...");

    try {
      const respuesta = await fetch(`http://127.0.0.1:8000/carrito/${detalleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ Cantidad: nuevaCantidad })
      });

      if (!respuesta.ok) throw new Error("Error al actualizar la cantidad");

      toast.success("Cantidad actualizada", { id: toastId });
      cargarCarrito(); 

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  // Función directa para vaciar (ya sin el alert de Windows)
  const procesarVaciarCarrito = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/carrito", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!respuesta.ok) throw new Error("Error al vaciar el carrito");

      toast.success("Carrito vaciado correctamente");
      cargarCarrito();

    } catch (err: any) {
      toast.error(err.message);
    }
  };

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

      toast.success("¡Compra finalizada con éxito!", { duration: 3000, style: { fontWeight: 'bold' } });
      cargarCarrito();
    } catch (err: any) {
      toast.error(err.message);
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
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
          >
            Volver al catálogo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto text-black">
          <table className="w-full text-left min-w-max">
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
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => cambiarCantidad(item.DetalleID, item.Cantidad - 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-8 h-8 rounded flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="font-semibold w-4 text-center">{item.Cantidad}</span>
                      <button 
                        onClick={() => cambiarCantidad(item.DetalleID, item.Cantidad + 1)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-8 h-8 rounded flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  
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

          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-t">
            
            <button 
              // En lugar de vaciar directo, ahora abre el modal de vaciar
              onClick={() => setMostrarModalVaciar(true)}
              className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition w-full sm:w-auto"
            >
              Vaciar Carrito
            </button>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded text-lg font-bold hover:bg-blue-700 transition"
              >
                ← Seguir comprando
              </button>

              <button 
                // Abre el modal de pago
                onClick={() => setMostrarModalPago(true)}
                className="bg-green-600 text-white px-6 py-3 rounded text-lg font-bold hover:bg-green-700 transition"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIRMAR PAGO */}
      {mostrarModalPago && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded shadow-2xl border border-gray-300 text-center max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Confirmar Pago</h2>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas procesar el pago por <strong>${carrito?.Total}</strong>?</p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setMostrarModalPago(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition w-full"
              >
                No, cancelar
              </button>
              
              <button 
                onClick={() => {
                  setMostrarModalPago(false); 
                  procesarPago(); 
                }}
                className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition w-full"
              >
                Sí, pagar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAR VACIAR CARRITO */}
      {mostrarModalVaciar && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded shadow-2xl border border-red-200 text-center max-w-sm w-full mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-red-600">Vaciar Carrito</h2>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar todos los libros de tu carrito?</p>
            
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setMostrarModalVaciar(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition w-full"
              >
                No, mantener
              </button>
              
              <button 
                onClick={() => {
                  setMostrarModalVaciar(false); 
                  procesarVaciarCarrito(); 
                }}
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition w-full"
              >
                Sí, vaciar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}