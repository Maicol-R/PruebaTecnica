using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Data
{
    public interface IClienteRepository
    {
        Task<PaginatedResult<Cliente>> GetClientesAsync(
            string searchTerm,
            string orderBy,
            string orderDirection,
            int pageNumber,
            int pageSize);
        Task<Cliente> GetClienteByIdAsync(int id);
        Task<int> AddClienteAsync(Cliente cliente);
        Task<bool> UpdateClienteAsync(Cliente cliente);
        Task<bool> DeleteClienteAsync(int id);
        Task<Cliente> GetClienteByEmailAsync(string email);
    }
}