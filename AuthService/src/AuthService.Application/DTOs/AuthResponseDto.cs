using System.Drawing;

namespace AuthService.Application.DTOs;

public class AuthResponseDto
{
    public bool Success { get; set; } = false;
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UserDetailsDto UserDetailsDto { get; set; } = new();
    public DateTime ExpireAt{ get; set; } 
}
