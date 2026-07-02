"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // NUEVO: Estado para controlar si el menú desplegable está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false); 
  const pathname = usePathname(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    // Cerramos el menú automáticamente cada vez que el usuario cambie de pantalla
    setMenuAbierto(false); 
  }, [pathname]);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    // Agregamos "relative" al nav para que el menú móvil se posicione correctamente justo debajo
    <nav className="bg-blue-600 p-4 text-white shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Título / Logo */}
        <Link href="/" className="text-xl font-bold hover:text-gray-200 transition">
          Mi Tienda de Libros
        </Link>

        {/* NUEVO: Botón de Hamburguesa (Solo se muestra en celulares y tablets: md:hidden) */}
        <button 
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="block md:hidden focus:outline-none p-1 text-white hover:text-gray-200 transition"
          aria-label="Alternar menú de navegación"
        >
          {/* Usamos un SVG dinámico que cambia de forma según el estado */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {menuAbierto ? (
              // Icono de una "X" para cerrar cuando el menú está abierto
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Icono tradicional de 3 líneas horizontales cuando está cerrado
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Menú Tradicional para Pantallas Grandes (Oculto en móviles: hidden md:flex) */}
        <div className="hidden md:flex gap-4 items-center font-medium">
          {isLoggedIn ? (
            <>
              <Link href="/historial" className="hover:text-gray-200 transition">
                Mis Compras
              </Link>
              <Link href="/carrito" className="hover:text-gray-200 transition">
                Mi Carrito
              </Link>
              <button 
                onClick={cerrarSesion} 
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition font-semibold"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition font-semibold text-white">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      {/* NUEVO: Menú Desplegable Móvil (Solo renderiza si menuAbierto es true en pantallas chicos md:hidden) */}
      {menuAbierto && (
        <div className="absolute top-full left-0 w-full bg-blue-700 shadow-lg border-t border-blue-500 flex flex-col items-center gap-2 py-4 md:hidden font-medium text-lg animate-fadeIn">
          {isLoggedIn ? (
            <>
              <Link 
                href="/historial" 
                className="w-full text-center py-2 hover:bg-blue-800 transition"
              >
                Mis Compras
              </Link>
              <Link 
                href="/carrito" 
                className="w-full text-center py-2 hover:bg-blue-800 transition"
              >
                Mi Carrito
              </Link>
              <div className="w-full px-4 pt-2">
                <button 
                  onClick={cerrarSesion} 
                  className="bg-red-500 w-full py-2.5 rounded hover:bg-red-600 transition font-bold"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <div className="w-full px-4 py-2">
              <Link 
                href="/login" 
                className="bg-green-500 block w-full text-center py-2.5 rounded hover:bg-green-600 transition font-bold text-white"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}