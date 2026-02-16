namespace AuthService.Application.DTOs;

public class UpdateUserDto
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public string Phone { get; set; } = string.Empty;
}
