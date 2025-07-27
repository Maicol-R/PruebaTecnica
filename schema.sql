-- Crear Base De Datos
CREATE DATABASE DBPruebaTecnica;
GO

-- Usar La Base De Datos
USE DBPruebaTecnica;
GO

-- Crear Tabla Clientes
CREATE TABLE Clientes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Telefono NVARCHAR(20),
    FechaNacimiento DATE,
    Activo BIT NOT NULL DEFAULT 1
);
GO

-- Insertar Datos Clientes
INSERT INTO Clientes (Nombre, Apellido, Email, Telefono, FechaNacimiento, Activo) VALUES
('Maicol', 'Escamilla', 'maicol2001escamilla@gmail.com', '3132573298', '2001-11-06', 1),
('Juan', 'Perez', 'juanperez@gmail.com', '123456789', '1990-05-15', 0),
('Maria', 'Gomez', 'maria.gomez@gmail.com', NULL, '1988-11-20', 1),
('Carlos', 'Rodriguez', 'carlosro@gmail.com', '987654321', NULL, 0),
('Ana', 'Lopez', 'ana27@gmail.com', '2345678', '1995-03-10', 1);
GO
