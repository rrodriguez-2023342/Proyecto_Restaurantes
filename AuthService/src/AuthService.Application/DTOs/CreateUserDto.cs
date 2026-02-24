using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class CreateUserDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Surname { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }

    // Optional role name (e.g., ADMIN_ROLE or USER_ROLE). Defaults to USER_ROLE.
    public string? Role { get; set; }
}
