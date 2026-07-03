"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Reutilizamos la interfaz del libro
interface Libro {
  LibroID: number;
  Titulo: string;
  Autor: string;
  Precio: number;
  Stock: number;
  ImagenURL: string;
}

export default function AdminLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para controlar la ventana flotante (Modal) del formulario
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarLibros = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/libros");
      if (!res.ok) throw new Error("Error al cargar los libros");
      const data = await res.json();
      setLibros(data);
    } catch (error) {
      toast.error("No se pudo cargar el catálogo");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLibros();
  }, []);

  // Funciones placeholder que conectaremos con Python en el próximo paso
  const abrirFormularioNuevo = () => {
    setModalAbierto(true);
  };

  const eliminarLibro = (id: number) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este libro? Esta acción no se puede deshacer.");
    if (confirmar) {
      toast.error("Función de eliminar pendiente de conectar al backend");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Libros</h1>
        <button 
          onClick={abrirFormularioNuevo}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition shadow"
        >
          + Agregar Nuevo Libro
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {cargando ? (
          <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4 rounded-tl-lg">ID</th>
                <th className="p-4">Portada</th>
                <th className="p-4">Título</th>
                <th className="p-4">Autor</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4 rounded-tr-lg text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {libros.map((libro) => (
                <tr key={libro.LibroID} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold text-gray-600">#{libro.LibroID}</td>
                  <td className="p-4">
                    <img 
                      src={libro.ImagenURL} 
                      alt={libro.Titulo} 
                      className="w-12 h-16 object-cover rounded shadow border"
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/50x70?text=Sin+Foto"; }}
                    />
                  </td>
                  <td className="p-4 font-medium">{libro.Titulo}</td>
                  <td className="p-4 text-gray-600">{libro.Autor}</td>
                  <td className="p-4 font-bold text-green-600">${libro.Precio}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${libro.Stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {libro.Stock} unid.
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      onClick={() => toast.error("Función editar pendiente")}
                      className="bg-yellow-500 text-white px-3 py-1 rounded font-medium hover:bg-yellow-600 transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarLibro(libro.LibroID)}
                      className="bg-red-500 text-white px-3 py-1 rounded font-medium hover:bg-red-600 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DEL FORMULARIO (Oculto por defecto) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Agregar/Editar Libro</h2>
              <button onClick={() => setModalAbierto(false)} className="text-gray-300 hover:text-white text-2xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 text-center text-gray-600 py-12">
              <p>Aquí irá nuestro formulario con inputs para el Título, Autor, Precio, etc.</p>
              <p className="text-sm mt-2">(Primero necesitamos preparar el backend para recibir estos datos)</p>
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400 transition">Cancelar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition">Guardar Libro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}