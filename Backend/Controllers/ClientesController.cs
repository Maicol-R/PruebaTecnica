using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly IClienteRepository _clienteRepository;

        public ClientesController(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        // GET api/clientes
        /// <summary>
        /// Trae la lista de clientes con paginación, búsqueda y ordenamiento.
        /// </summary>
        /// <param name="searchTerm">Término de búsqueda para nombre, apellido, email, teléfono.</param>
        /// <param name="orderBy">Campo por el cual ordenar (ej. "Nombre", "Email", "Id").</param>
        /// <param name="orderDirection">Dirección del ordenamiento ("asc" o "desc").</param>
        /// <param name="pageNumber">Número de página a recuperar (empieza en 1).</param>
        /// <param name="pageSize">Cantidad de elementos por página.</param>
        /// <returns>Objeto con lista de clientes paginados y metadatos de paginación.</returns>
        [HttpGet]
        public async Task<IActionResult> GetClientes(
            [FromQuery] string searchTerm = null,
            [FromQuery] string orderBy = "Id",
            [FromQuery] string orderDirection = "asc",
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            // Asegura que los valores de paginación sean válidos
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            try
            {
                var result = await _clienteRepository.GetClientesAsync(searchTerm, orderBy, orderDirection, pageNumber, pageSize);
                return Ok(result); // Retorna 200 OK con el resultado paginado (PaginatedResult<Cliente>)
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener clientes: {ex.Message}");
                return StatusCode(500, "Error interno del servidor al obtener la lista de clientes.");
            }
        }

        // GET api/clientes/{id}
        /// <summary>
        /// Busca un cliente usando su ID.
        /// </summary>
        /// <param name="id">ID único del cliente.</param>
        /// <returns>El cliente si se encuentra, o 404 si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _clienteRepository.GetClienteByIdAsync(id);
            if (cliente == null)
            {
                return NotFound("No pudimos encontrar un cliente con ese ID.");
            }
            return Ok(cliente);
        }

        // POST api/clientes
        /// <summary>
        /// Crea un nuevo cliente.
        /// </summary>
        /// <param name="cliente">Datos del cliente a registrar.</param>
        /// <returns>El cliente creado con su ID, o error si algo falla.</returns>
        [HttpPost]
        public async Task<ActionResult<Cliente>> PostCliente([FromBody] Cliente cliente)
        {
            if (string.IsNullOrWhiteSpace(cliente.Nombre))
            {
                return BadRequest("Falta el nombre.");
            }
            if (string.IsNullOrWhiteSpace(cliente.Apellido))
            {
                return BadRequest("Falta el apellido.");
            }
            if (string.IsNullOrWhiteSpace(cliente.Email))
            {
                return BadRequest("El email es obligatorio.");
            }

            // Validar formato del email
            if (!Regex.IsMatch(cliente.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest("Este email no tiene un formato válido.");
            }

            // Validar que el email no exista ya en la base
            try
            {
                var existingCliente = await _clienteRepository.GetClienteByEmailAsync(cliente.Email);
                if (existingCliente != null)
                {
                    return Conflict("El email ya está registrado.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar email existente: {ex.Message}");
                return StatusCode(500, "Error interno del servidor al verificar el email.");
            }


            // Validar que la fecha de nacimiento no sea futura
            if (cliente.FechaNacimiento.HasValue && cliente.FechaNacimiento.Value > DateTime.Today)
            {
                return BadRequest("La fecha de nacimiento no puede ser en el futuro.");
            }

            try
            {
                // AddClienteAsync debería retornar el ID o el objeto completo si el ID se genera en la DB
                var newId = await _clienteRepository.AddClienteAsync(cliente);
                cliente.Id = newId; // Asigna el ID generado

                return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, cliente);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear cliente: {ex.Message}");
                return StatusCode(500, $"Error interno al crear el cliente: {ex.Message}");
            }
        }

        // PUT api/clientes/{id}
        /// <summary>
        /// Modifica los datos de un cliente existente.
        /// </summary>
        /// <param name="id">ID del cliente a actualizar.</param>
        /// <param name="cliente">Datos nuevos del cliente.</param>
        /// <returns>204 si se actualiza correctamente o error si algo falla.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCliente(int id, [FromBody] Cliente cliente)
        {
            if (id != cliente.Id)
            {
                return BadRequest("El ID de la URL no coincide con el del cliente proporcionado.");
            }

            // Primero, verifica si el cliente existe antes de aplicar validaciones y actualizaciones
            var existingClienteById = await _clienteRepository.GetClienteByIdAsync(id);
            if (existingClienteById == null)
            {
                return NotFound("Cliente no encontrado para actualizar.");
            }

            // Validaciones obligatorias
            if (string.IsNullOrWhiteSpace(cliente.Nombre) || string.IsNullOrWhiteSpace(cliente.Apellido) || string.IsNullOrWhiteSpace(cliente.Email))
            {
                return BadRequest("Nombre, apellido y email son obligatorios.");
            }
            if (!Regex.IsMatch(cliente.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest("El formato del email no es válido.");
            }

            // Validar que el email no esté duplicado en la base (excepto para el mismo cliente que se está actualizando)
            try
            {
                var existingClienteWithEmail = await _clienteRepository.GetClienteByEmailAsync(cliente.Email);
                if (existingClienteWithEmail != null && existingClienteWithEmail.Id != cliente.Id)
                {
                    return Conflict("El email ya está registrado por otro cliente.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar email existente durante la actualización: {ex.Message}");
                return StatusCode(500, "Error interno del servidor al verificar el email durante la actualización.");
            }


            if (cliente.FechaNacimiento.HasValue && cliente.FechaNacimiento.Value > DateTime.Today)
            {
                return BadRequest("La fecha de nacimiento no puede ser en el futuro.");
            }

            try
            {
                var success = await _clienteRepository.UpdateClienteAsync(cliente);
                if (!success)
                {
                    return StatusCode(500, "No se pudo actualizar el cliente. Posiblemente no existe o un error de concurrencia.");
                }
                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error interno al actualizar cliente: {ex.Message}");
                return StatusCode(500, $"Error interno al actualizar cliente: {ex.Message}");
            }
        }

        // DELETE api/clientes/{id}
        /// <summary>
        /// Elimina un cliente usando su ID.
        /// </summary>
        /// <param name="id">ID del cliente que queremos borrar.</param>
        /// <returns>204 si se elimina, o 404 si no se encuentra.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCliente(int id)
        {
            try
            {
                var success = await _clienteRepository.DeleteClienteAsync(id);
                if (!success)
                {
                    return NotFound("No encontramos al cliente para eliminarlo.");
                }
                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al eliminar cliente: {ex.Message}");
                return StatusCode(500, $"Error interno al eliminar cliente: {ex.Message}");
            }
        }
    }
}
