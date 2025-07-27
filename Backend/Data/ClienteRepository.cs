using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Dapper;
using Backend.Models;
using System.Text;
using System.Linq;
using System;

namespace Backend.Data
{
    // Operaciones de base de datos relacionadas con los clientes
    public class ClienteRepository : IClienteRepository
    {
        private readonly string _connectionString;

        // Obtenemos la cadena de conexión desde la configuración
        public ClienteRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // Método para obtener clientes con filtros, ordenamiento y paginación
        public async Task<PaginatedResult<Cliente>> GetClientesAsync(
            string searchTerm,
            string orderBy,
            string orderDirection,
            int pageNumber,
            int pageSize)
        {
            var parameters = new DynamicParameters();
            var sqlBuilder = new StringBuilder();
            sqlBuilder.Append("SELECT Id, Nombre, Apellido, Email, Telefono, FechaNacimiento, Activo FROM Clientes ");

            // Si hay un término de búsqueda, filtramos por nombre, apellido, email o teléfono
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                sqlBuilder.Append("WHERE LOWER(Nombre) LIKE @SearchTerm OR LOWER(Apellido) LIKE @SearchTerm OR LOWER(Email) LIKE @SearchTerm OR LOWER(Telefono) LIKE @SearchTerm ");
                parameters.Add("SearchTerm", "%" + searchTerm.ToLowerInvariant() + "%");
            }

            // Establecemos la dirección de ordenamiento
            string validOrderBy = "Id";
            string validOrderDirection = "ASC";

            var allowedOrderByColumns = new List<string> { "Id", "Nombre", "Apellido", "Email", "Telefono", "FechaNacimiento", "Activo" };
            if (allowedOrderByColumns.Contains(orderBy, StringComparer.OrdinalIgnoreCase))
            {
                validOrderBy = orderBy;
            }

            if (orderDirection?.ToLowerInvariant() == "desc")
            {
                validOrderDirection = "DESC";
            }

            // Aplicamos ordenamiento
            sqlBuilder.Append($"ORDER BY {validOrderBy} {validOrderDirection} ");

            // Aplicamos paginación para limitar la cantidad de datos devueltos
            sqlBuilder.Append("OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;");
            parameters.Add("Offset", (pageNumber - 1) * pageSize);
            parameters.Add("PageSize", pageSize);

            // Consulta adicional para contar cuántos registros hay en total
            var countSqlBuilder = new StringBuilder();
            countSqlBuilder.Append("SELECT COUNT(Id) FROM Clientes ");
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                countSqlBuilder.Append("WHERE LOWER(Nombre) LIKE @SearchTerm OR LOWER(Apellido) LIKE @SearchTerm OR LOWER(Email) LIKE @SearchTerm OR LOWER(Telefono) LIKE @SearchTerm ");
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                // Ejecutamos la consulta principal
                var clientes = await connection.QueryAsync<Cliente>(sqlBuilder.ToString(), parameters);

                // Ejecutamos la consulta de conteo total
                var totalItems = await connection.ExecuteScalarAsync<int>(countSqlBuilder.ToString(), parameters);

                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                // Construimos el resultado paginado
                return new PaginatedResult<Cliente>
                {
                    Data = clientes,
                    TotalItems = totalItems,
                    TotalPages = totalPages,
                    CurrentPage = pageNumber,
                    PageSize = pageSize
                };
            }
        }

        // Busca un cliente por su ID
        public async Task<Cliente> GetClienteByIdAsync(int id)
        {
            const string sql = "SELECT Id, Nombre, Apellido, Email, Telefono, FechaNacimiento, Activo FROM Clientes WHERE Id = @Id";
            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.QueryFirstOrDefaultAsync<Cliente>(sql, new { Id = id });
            }
        }

        // Inserta un nuevo cliente y devuelve el ID
        public async Task<int> AddClienteAsync(Cliente cliente)
        {
            const string sql = @"INSERT INTO Clientes (Nombre, Apellido, Email, Telefono, FechaNacimiento, Activo)
                                 VALUES (@Nombre, @Apellido, @Email, @Telefono, @FechaNacimiento, @Activo);
                                 SELECT CAST(SCOPE_IDENTITY() as int);";
            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.ExecuteScalarAsync<int>(sql, cliente);
            }
        }

        // Actualiza los datos de un cliente existente
        public async Task<bool> UpdateClienteAsync(Cliente cliente)
        {
            const string sql = @"UPDATE Clientes SET
                                 Nombre = @Nombre,
                                 Apellido = @Apellido,
                                 Email = @Email,
                                 Telefono = @Telefono,
                                 FechaNacimiento = @FechaNacimiento,
                                 Activo = @Activo
                                 WHERE Id = @Id;";
            using (var connection = new SqlConnection(_connectionString))
            {
                var affectedRows = await connection.ExecuteAsync(sql, cliente);
                return affectedRows > 0;
            }
        }

        // Elimina un cliente por su ID
        public async Task<bool> DeleteClienteAsync(int id)
        {
            const string sql = "DELETE FROM Clientes WHERE Id = @Id";
            using (var connection = new SqlConnection(_connectionString))
            {
                var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });
                return affectedRows > 0;
            }
        }

        // Busca un cliente por email
        public async Task<Cliente> GetClienteByEmailAsync(string email)
        {
            const string sql = "SELECT Id, Nombre, Apellido, Email, Telefono, FechaNacimiento, Activo FROM Clientes WHERE Email = @Email";
            using (var connection = new SqlConnection(_connectionString))
            {
                return await connection.QueryFirstOrDefaultAsync<Cliente>(sql, new { Email = email });
            }
        }
    }
}