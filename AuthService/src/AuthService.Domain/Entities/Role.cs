using System.ComponentModel.DataAnnotations;
using System.Data;
namespace AuthService.Domain.Entities;

public class Role
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;    

    [Required(ErrorMessage = "El nombre del rol es obligatorio")]
    [MaxLength(100, ErrorMessage = "El nombre del rol no puede superar los 100 carácteres.")]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdateAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserRole> UserRoles { get; set; } = [];
    
}

