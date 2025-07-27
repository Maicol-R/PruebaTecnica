using System;

namespace Backend.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Email { get; set; }
        public string Telefono { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public bool Activo { get; set; }
    }
}