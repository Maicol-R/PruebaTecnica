👋 Hola. ¡Bienvenido al Prueba Tecnica de Clientes!
Esta prueba tecnica es una aplicación web de gestión de clientes que permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre una base de datos de clientes. Está dividida en un backend (API RESTful en C# con ASP.NET Core y Dapper) y un frontend (HTML, CSS y JavaScript puro).

🚀 Características
Esta prueba incluye las siguientes funcionalidades clave:

CRUD Completo: Permite crear, visualizar, editar y eliminar registros de clientes.

Paginación de Clientes: Muestra los clientes en páginas, mejorando el rendimiento y la navegabilidad para grandes volúmenes de datos.

Búsqueda y Filtrado: Permite buscar clientes por nombre, apellido, email o teléfono.

Ordenamiento de Columnas: Los usuarios pueden hacer clic en los encabezados de la tabla para ordenar los clientes por diferentes campos (ID, Nombre, Apellido, Email, Fecha de Nacimiento, Activo) en orden ascendente o descendente.

Validación de Formulario en Tiempo Real: Proporciona feedback instantáneo al usuario sobre la validez de los datos ingresados en el formulario.

Indicadores de Carga: Muestra un spinner visual mientras se realizan operaciones de red (carga de datos, guardado, actualización, eliminación).

Resaltado de Fila Activa: La fila del cliente que se está editando se resalta visualmente en la tabla.

Modales de Confirmación: Implementa modales personalizados para confirmar operaciones de eliminación y actualización, mostrando un resumen de los cambios antes de confirmar la actualización.

Mensajes de Éxito y Error: Utiliza modales personalizados para notificaciones de éxito y un área dedicada para mensajes de error.

Botón "Cancelar Edición": Permite al usuario descartar los cambios en el formulario y volver al estado de creación.

🛠️ Tecnologías Utilizadas
Backend (API RESTful)
Frontend (Interfaz de Usuario)
📂 Estructura del Proyecto
TuProyecto/
├── Backend/
│   ├── Controllers/
│   │   └── ClientesController.cs      # Lógica de la API (endpoints, validaciones)
│   ├── Data/
│   │   ├── IClienteRepository.cs      # Interfaz del patrón Repositorio
│   │   └── ClienteRepository.cs       # Implementación del Repositorio (manejo de DB con Dapper)
│   ├── Models/
│   │   ├── Cliente.cs                 # Modelo de datos del cliente
│   │   └── PaginatedResult.cs         # DTO para resultados paginados
│   ├── Program.cs                     # Configuración de la aplicación ASP.NET Core (DI, CORS, etc.)
│   └── appsettings.json               # Configuración de la cadena de conexión a la DB
│   └── ... (otros archivos del proyecto C#)
└── Frontend/
    ├── css/
    │   └── style.css                  # Estilos personalizados para la aplicación
    ├── js/
    │   └── app.js                     # Lógica principal del frontend (interacción con API, UI)
    └── index.html                     # Estructura principal de la página web

⚙️ Configuración y Ejecución
Sigue estos pasos para configurar y ejecutar la aplicación en tu entorno local.

1. Configuración del Backend
Clonar el Repositorio:

git clone <URL_DE_TU_REPOSITORIO>
cd TuProyecto/Backend

Configurar la Base de Datos:

Abre appsettings.json en la carpeta Backend.

Modifica la DefaultConnection para que apunte a tu instancia de SQL Server.

{
  "ConnectionStrings": {
     "DefaultConnection": "Server=tu_servidor;Database=DBPruebaTecnica;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}

Asegúrate de que tu base de datos y la tabla Clientes existan y tengan la estructura adecuada. Puedes usar el siguiente script SQL para crear la base de datos y la tabla, e insertar algunos datos de ejemplo:

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

Restaurar Paquetes NuGet:

Abre una terminal en la carpeta Backend.

Ejecuta:

dotnet restore

Compilar y Ejecutar el Backend:

Desde la terminal en la carpeta Backend, ejecuta:

dotnet run

Esto iniciará la API, generalmente en https://localhost:7082 (verifica la URL en la salida de la consola).

2. Configuración del Frontend
Navegar a la Carpeta Frontend:

cd ../Frontend

Verificar la URL de la API:

Abre js/app.js.

Asegúrate de que la constante API_BASE_URL coincida con la URL donde se está ejecutando tu backend (ej. https://localhost:7082/api/clientes).

Instalar Live Server (si no lo tienes):

Si usas Visual Studio Code, puedes instalar la extensión "Live Server" de Ritwick Dey.

Abrir el Frontend con Live Server:

En Visual Studio Code, haz clic derecho en el archivo index.html (o en la carpeta Frontend) y selecciona "Open with Live Server".

Esto abrirá la aplicación frontend en tu navegador, generalmente en http://127.0.0.1:5500 o similar.

🚀 Uso de la Aplicación
Ver Clientes: Al abrir la aplicación, verás una tabla con la lista de clientes existentes (si los hay).

Crear Cliente:

Rellena el formulario en la parte superior de la página.

Haz clic en "Guardar Cliente".

Se mostrará un modal de éxito si la operación es exitosa.

Editar Cliente:

Haz clic en el botón "Editar" junto al cliente que deseas modificar en la tabla.

Los datos del cliente se cargarán en el formulario y la fila se resaltará.

Realiza los cambios deseados.

Haz clic en "Actualizar Cliente". Se abrirá un modal de confirmación mostrando los cambios antes de guardar.

Si no hay cambios, recibirás un mensaje indicando que no se detectaron modificaciones.

Eliminar Cliente:

Haz clic en el botón "Eliminar" junto al cliente que deseas borrar.

Se abrirá un modal de confirmación para que confirmes la eliminación.

Buscar Clientes:

Usa el campo "Buscar Cliente" para filtrar la tabla por nombre, apellido, email o teléfono. La búsqueda se aplica automáticamente al escribir (con un pequeño retraso).

Paginación:

Utiliza los botones "Anterior", "Siguiente" y los números de página en la parte inferior de la tabla para navegar entre las páginas de clientes.

Usa el selector "Clientes por página" para cambiar la cantidad de clientes que se muestran por página.

Ordenar Columnas:

Haz clic en los encabezados de la tabla (ej. "Nombre", "Email") para ordenar los clientes por esa columna. Un icono indicará si el orden es ascendente o descendente.

❓ Preguntas Frecuentes (FAQ)
¿Cómo cambio la base de datos?

Modifica la cadena de conexión en appsettings.json del backend.

¿Por qué no carga la tabla de clientes?

Asegúrate de que el backend esté ejecutándose y que la API_BASE_URL en js/app.js sea correcta. Revisa la consola del navegador (F12) para ver errores de red o de CORS.

💖 Agradecimientos
Un agradecimiento especial a:

Dapper: Por ser un micro-ORM rápido y eficiente.

Bootstrap: Por facilitar el diseño responsivo y los componentes UI.

Font Awesome: Por los iconos tan útiles.

Live Server: Por hacer el desarrollo frontend mucho más fácil.

<p align="center">Hecho con ❤️ por Maicol Rodriguez</p>