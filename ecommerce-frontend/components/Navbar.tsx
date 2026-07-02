"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false); 
  const [datosUsuario, setDatosUsuario] = useState<{Nombre: string, Rol: string} | null>(null);
  
  const pathname = usePathname(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      obtenerDatosUsuario(token);
    } else {
      setIsLoggedIn(false);
      setDatosUsuario(null);
    }
    setMenuAbierto(false); 
  }, [pathname]);

  const obtenerDatosUsuario = async (token: string) => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/usuarios/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setDatosUsuario(datos);
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario", error);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDatosUsuario(null);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        <Link href="/" className="text-xl font-bold hover:text-gray-200 transition">
          Mi Tienda de Libros
        </Link>

        <button 
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="block md:hidden focus:outline-none p-1 text-white hover:text-gray-200 transition"
          aria-label="Alternar menú de navegación"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {menuAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* --- MENÚ DE ESCRITORIO --- */}
        <div className="hidden md:flex gap-4 items-center font-medium">
          {isLoggedIn ? (
            <>
              {datosUsuario && (
                <span className="bg-blue-800 text-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold mr-2 shadow-inner border border-blue-500">
                  {datosUsuario.Rol}: {datosUsuario.Nombre}
                </span>
              )}

              {/* NUEVO BOTÓN: Solo se muestra si el rol es Administrador */}
              {datosUsuario?.Rol === "Administrador" && (
                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 font-bold transition mr-2 flex items-center gap-1">
                  ⚙️ Panel Admin
                </Link>
              )}

              <Link href="/historial" className="hover:text-gray-200 transition">
                Mis Compras
              </Link>
              <Link href="/carrito" className="hover:text-gray-200 transition">
                Mi Carrito
              </Link>
              <button 
                onClick={cerrarSesion} 
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition font-semibold ml-2"
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

      {/* --- MENÚ MÓVIL --- */}
      {menuAbierto && (
        <div className="absolute top-full left-0 w-full bg-blue-700 shadow-lg border-t border-blue-500 flex flex-col items-center py-2 md:hidden font-medium text-lg animate-fadeIn">
          {isLoggedIn ? (
            <>
              {datosUsuario && (
                <div className="w-full text-center py-3 mb-2 bg-blue-800 text-blue-100 text-sm font-bold tracking-wide uppercase border-b border-blue-600">
                  {datosUsuario.Rol} • {datosUsuario.Nombre}
                </div>
              )}

              {/* NUEVO BOTÓN: Solo se muestra si el rol es Administrador */}
              {datosUsuario?.Rol === "Administrador" && (
                <Link href="/admin" className="w-full text-center py-3 text-yellow-400 hover:bg-blue-800 transition font-bold border-b border-blue-600">
                  ⚙️ Panel Admin
                </Link>
              )}
              
              <Link href="/historial" className="w-full text-center py-3 hover:bg-blue-800 transition">
                Mis Compras
              </Link>
              <Link href="/carrito" className="w-full text-center py-3 hover:bg-blue-800 transition">
                Mi Carrito
              </Link>
              <div className="w-full px-6 pt-4 pb-2 border-t border-blue-600 mt-2">
                <button 
                  onClick={cerrarSesion} 
                  className="bg-red-500 w-full py-3 rounded hover:bg-red-600 transition font-bold"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <div className="w-full px-6 py-4">
              <Link href="/login" className="bg-green-500 block w-full text-center py-3 rounded hover:bg-green-600 transition font-bold text-white">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}