-- 1. Insertar Categorías
-- Estas son las agrupaciones de nuestros libros.
INSERT INTO Categorias (Nombre, Descripcion) VALUES 
('Programación', 'Libros sobre lenguajes, frameworks y desarrollo de software'),
('Bases de Datos', 'Arquitectura, SQL, modelado y administración de datos'),
('Ficción', 'Novelas, cuentos y literatura general');

-- 2. Insertar Usuarios
-- Creamos un administrador y un cliente estándar. 
-- Nota: En un entorno real, el 'PasswordHash' será una cadena ilegible generada por el backend.
INSERT INTO Usuarios (Nombre, Correo, PasswordHash, EsAdmin) VALUES 
('Admin Tienda', 'admin@mitienda.com', 'admin123', 1),
('Cliente Prueba', 'cliente@hotmail.com', 'cliente456', 0);

-- 3. Insertar Libros
-- Relacionamos cada libro con su respectiva categoría usando el CategoriaID generado en el paso 1.
INSERT INTO Libros (Titulo, Autor, Descripcion, Precio, Stock, ImagenURL, CategoriaID) VALUES 
('Clean Code', 'Robert C. Martin', 'Manual de buenas prácticas de programación ágil.', 35000.00, 15, 'https://images.cdn1.buscalibre.com/fit-in/360x360/87/da/87da3d378f0336fd04014c4ea153d064.jpg', 1),
('Fundamentos de SQL Server', 'Itzik Ben-Gan', 'Guía profunda sobre consultas y T-SQL.', 42000.00, 10, 'https://m.media-amazon.com/images/I/61yb+Hy+rHL._SL1500_.jpg', 2),
('El Archivo de las Tormentas', 'Brandon Sanderson', 'Fantasía épica y desarrollo de mundos.', 28000.00, 5, 'https://images.cdn1.buscalibre.com/fit-in/360x360/d8/5f/d85f51614b3767145ca19b306d0d96bf.jpg', 3);

-- 4. Simular una Orden de Compra (Cabecera)
-- Asumimos que el "Cliente Prueba" (UsuarioID = 2) hace una compra.
INSERT INTO Ordenes (UsuarioID, Total, Estado) VALUES 
(2, 77000.00, 'Pagado');

-- 5. Simular el Detalle de la Orden
-- Detallamos qué libros compró en esa orden (OrdenID = 1).
-- Compró 1 copia de 'Clean Code' (LibroID = 1) y 1 copia de 'Fundamentos de SQL Server' (LibroID = 2).
INSERT INTO DetalleOrdenes (OrdenID, LibroID, Cantidad, PrecioUnitario) VALUES 
(1, 1, 1, 35000.00),
(1, 2, 1, 42000.00);

SELECT * FROM Usuarios
select * from Libros
select * from Categorias
UPDATE Usuarios SET EsAdmin = 1 WHERE UsuarioID = 3;
select * from Ordenes
select * from DetalleOrdenes
UPDATE Usuarios SET EsAdmin = 1 WHERE Correo = 'admin2@mitienda.com';

UPDATE Libros 
SET Activo = 0 
WHERE LibroID = 5;


DELETE FROM dbo.DetalleOrdenes 
WHERE LibroID = 5;

DELETE FROM Libros 
WHERE LibroID = 5;