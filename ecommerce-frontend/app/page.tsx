import BotonAgregar from "../components/BotonAgregar";

interface Libro {
  LibroID: number;
  Titulo: string;
  Autor: string;
  Descripcion: string;
  Precio: number;
  Stock: number;
}

async function getLibros(): Promise<Libro[]> {
  const res = await fetch("http://127.0.0.1:8000/libros", { 
    cache: "no-store" 
  });
  
  if (!res.ok) {
    throw new Error("No se pudieron cargar los libros");
  }
  
  return res.json();
}

export default async function Home() {
  const libros = await getLibros();

  return (
    <main className="p-8 max-w-7xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Catálogo de Libros</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {libros.map((libro) => (
          <div key={libro.LibroID} className="border border-gray-300 rounded shadow hover:shadow-lg transition flex flex-col bg-white overflow-hidden">
            
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center border-b border-gray-200">
              <img 
                src={`/portadas/${libro.LibroID}.jpg`} 
                alt={`Portada de ${libro.Titulo}`}
                className="w-full h-full object-contain p-2"
                /* Eliminamos el evento onError para mantener la compatibilidad con el servidor */
              />
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{libro.Titulo}</h2>
              <p className="text-gray-600 mb-2">Por: {libro.Autor}</p>
              <p className="text-sm text-gray-500 mb-4 flex-grow">{libro.Descripcion}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-gray-900">${libro.Precio}</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black font-semibold">
                  Stock: {libro.Stock}
                </span>
              </div>
              
              <BotonAgregar libroId={libro.LibroID} />
            </div>
            
          </div>
        ))}
        
      </div>
    </main>
  );
}