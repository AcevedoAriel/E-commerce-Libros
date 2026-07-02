// 1. Definimos la "Interface" para que TypeScript conozca la estructura de un Libro
interface Libro {
  LibroID: number;
  Titulo: string;
  Autor: string;
  Descripcion: string | null;
  Precio: number;
  Stock: number;
  ImagenURL: string | null;
  CategoriaID: number;
}

export default async function Home() {
  
  // 2. Conectamos con el endpoint de libros de tu API de Python
  const respuesta = await fetch("http://127.0.0.1:8000/libros", {
    cache: "no-store" 
  });

  // 3. Convertimos la respuesta y le decimos a TypeScript que es un Array de Libros (Libro[])
  const libros: Libro[] = await respuesta.json();

  // 4. Renderizamos la interfaz
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Catálogo de Libros</h1>
      
      {/* Contenedor tipo grilla para mostrar los libros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recorremos la lista de libros y creamos una tarjeta para cada uno */}
        {libros.map((libro) => (
          <div key={libro.LibroID} className="border p-4 rounded shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{libro.Titulo}</h2>
            <p className="text-gray-600 mb-2">Por: {libro.Autor}</p>
            <p className="text-sm text-gray-500 mb-4">{libro.Descripcion}</p>
            
            <div className="flex justify-between items-center mt-auto">
              <span className="font-bold text-lg">${libro.Precio}</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">Stock: {libro.Stock}</span>
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}