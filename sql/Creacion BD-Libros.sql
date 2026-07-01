CREATE DATABASE Libros;

GO

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(150) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL, -- Aquí guardaremos la contraseña encriptada
    FechaRegistro DATETIME DEFAULT GETDATE(),
    EsAdmin BIT DEFAULT 0 -- 0 = Cliente, 1 = Administrador
);

-- Tabla de Categorías de Libros
CREATE TABLE Categorias (
    CategoriaID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) UNIQUE NOT NULL,
    Descripcion NVARCHAR(255) NULL
);

-- Tabla de Libros
CREATE TABLE Libros (
    LibroID INT IDENTITY(1,1) PRIMARY KEY,
    Titulo NVARCHAR(200) NOT NULL,
    Autor NVARCHAR(150) NOT NULL,
    Descripcion NVARCHAR(MAX) NULL,
    Precio DECIMAL(10, 2) NOT NULL CHECK (Precio >= 0),
    Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0),
    ImagenURL NVARCHAR(500) NULL,
    CategoriaID INT,
    CONSTRAINT FK_Libros_Categorias FOREIGN KEY (CategoriaID) 
        REFERENCES Categorias(CategoriaID) ON DELETE SET NULL
);


-- Tabla de Órdenes (Cabecera)
CREATE TABLE Ordenes (
    OrdenID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    FechaOrden DATETIME DEFAULT GETDATE(),
    Total DECIMAL(12, 2) NOT NULL,
    Estado NVARCHAR(20) DEFAULT 'Pendiente', -- Pendiente, Pagado, Enviado, Cancelado
    CONSTRAINT FK_Ordenes_Usuarios FOREIGN KEY (UsuarioID) 
        REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Detalle de Órdenes (Ítems comprados)
CREATE TABLE DetalleOrdenes (
    DetalleID INT IDENTITY(1,1) PRIMARY KEY,
    OrdenID INT NOT NULL,
    LibroID INT NOT NULL,
    Cantidad INT NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario DECIMAL(10, 2) NOT NULL, -- Guardamos el precio al momento de la compra
    CONSTRAINT FK_Detalle_Ordenes FOREIGN KEY (OrdenID) 
        REFERENCES Ordenes(OrdenID) ON DELETE CASCADE,
    CONSTRAINT FK_Detalle_Libros FOREIGN KEY (LibroID) 
        REFERENCES Libros(LibroID)
);