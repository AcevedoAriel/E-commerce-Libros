export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido al Panel de Administración</h1>
      <p className="text-gray-600 mb-8 text-lg">Desde aquí tienes el control total sobre la plataforma de tu e-commerce.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>📚</span> Módulo de Libros
          </h2>
          <p className="text-gray-600 mb-4">Administra el catálogo público. Agrega nuevas obras, actualiza precios, controla el stock y elimina libros descatalogados.</p>
          <a href="/admin/libros" className="text-blue-600 font-semibold hover:underline">Ir a gestionar libros →</a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 hover:shadow-lg transition">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>👥</span> Módulo de Usuarios
          </h2>
          <p className="text-gray-600 mb-4">Revisa las cuentas de la plataforma. Asigna permisos de administración y asegura el entorno de tus clientes.</p>
          <a href="/admin/usuarios" className="text-green-600 font-semibold hover:underline">Ir a gestionar usuarios →</a>
        </div>

      </div>
    </div>
  );
}