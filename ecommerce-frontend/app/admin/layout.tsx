"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [autorizado, setAutorizado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verificarPermisos = async () => {
      const token = localStorage.getItem("token");
      
      // Si no hay token, lo pateamos al inicio
      if (!token) {
        router.push("/");
        return;
      }

      try {
        // Le preguntamos al backend qué rol tiene el dueño de este token
        const respuesta = await fetch("http://127.0.0.1:8000/usuarios/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          // Si es Administrador, lo dejamos pasar
          if (datos.Rol === "Administrador") {
            setAutorizado(true);
          } else {
            // Si es Cliente, lo pateamos al inicio
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      } finally {
        setCargando(false);
      }
    };

    verificarPermisos();
  }, [router]);

  // Pantalla de carga mientras verificamos con el backend
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-black">
        <p className="text-xl font-bold animate-pulse">Verificando credenciales de administrador...</p>
      </div>
    );
  }

  // Si terminó de cargar y no está autorizado, no dibujamos nada (se redirigirá en breve)
  if (!autorizado) return null;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black">
      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-blue-400">Panel Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Gestión de E-commerce</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 font-medium">
          <Link 
            href="/admin" 
            className={`block p-3 rounded hover:bg-gray-800 transition ${pathname === '/admin' ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/admin/libros" 
            className={`block p-3 rounded hover:bg-gray-800 transition ${pathname.includes('/admin/libros') ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
          >
            📚 Gestión de Libros
          </Link>
          <Link 
            href="/admin/usuarios" 
            className={`block p-3 rounded hover:bg-gray-800 transition ${pathname.includes('/admin/usuarios') ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
          >
            👥 Gestión de Usuarios
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="block p-3 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition text-center text-sm border border-gray-700">
            ← Volver a la Tienda
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO DERECHA (Aquí se cargarán las páginas) */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}