"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // useEffect se ejecuta una vez cuando el componente aparece en pantalla.
  // Aquí revisamos si la llave digital existe en el navegador.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const cerrarSesion = () => {
    // Para cerrar sesión, simplemente destruimos la llave y actualizamos el estado
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    // Redirigimos al usuario para que vuelva a entrar
    // Reemplazá router.push("/login"); por esto:
    window.location.href = "/login";

  };

  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* El logo o título que siempre lleva al inicio */}
        <Link href="/" className="text-xl font-bold hover:text-gray-200 transition">
          Mi Tienda de Libros
        </Link>

        {/* Los enlaces condicionales */}
        <div className="flex gap-4 items-center font-medium">
          {isLoggedIn ? (
            <>
              {/* Si está logueado, le mostramos su carrito y la opción de salir */}
              <Link href="/carrito" className="hover:text-gray-200 transition">
                Mi Carrito
              </Link>
              <button 
                onClick={cerrarSesion} 
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            // Si NO está logueado, le pedimos que inicie sesión
            <Link href="/login" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}