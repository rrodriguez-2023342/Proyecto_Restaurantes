using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class User
{
    [Key]
    [MaxLength(16)]
    public string Id { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(25, ErrorMessage = "El nombre no puede tener más de 25 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El Apellido es obligatorio.")]
    [MaxLength(25, ErrorMessage = "El Apellido no puede tener más de 25 caracteres.")]
    public string Surname { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
    [MaxLength(25, ErrorMessage = "El nombre de usuario no puede tener más de 25 caracteres.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electronico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo electronico no tiene un formato valido.")]
    [MaxLength(150, ErrorMessage = "El correo electronico no puede tener más de 150 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 carácteres.")]
    [MaxLength(255, ErrorMessage = "La contrase no puede tener más de 255 carácteres.")]
    public string Password { get; set; } = string.Empty;

    public bool Status { get; set;} = false;

    public DateTime CreateAt { get; set; }
    public DateTime UpdateAt { get; set; }

    public UserProfile UserProfile { get; set; } = null!;

    public ICollection<UserRole> UserRoles { get; set; } = [];

    public UserEmail UserEmail { get; set;} = null!;
    public UserPasswordReset UserPasswordReset  { get; set;} = null!;
}

