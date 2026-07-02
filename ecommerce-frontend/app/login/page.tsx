"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Adaptamos el envío al formato de formulario x-www-form-urlencoded que pide tu API
      const detallesFormulario = new URLSearchParams();
      detallesFormulario.append("username", correo); // Tu backend espera 'username' para el mail
      detallesFormulario.append("password", password);

      const respuesta = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: detallesFormulario.toString(),
      });

      if (!respuesta.ok) {
        throw new Error("Correo o contraseña incorrectos");
      }

      const datos = await respuesta.json();

      // Guardamos la llave digital en el navegador
      localStorage.setItem("token", datos.access_token);
      
      // Redirigimos al catálogo principal
      // Reemplazá router.push("/"); por esto:
      window.location.href = "/";
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-4 text-black">
      <form 
        onSubmit={iniciarSesion} 
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Iniciar Sesión</h1>
        
        {error && <p className="text-red-500 mb-4 text-sm text-center font-semibold">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Correo Electrónico</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-bold"
        >
          Entrar a la Tienda
        </button>
      </form>
    </main>
  );
}