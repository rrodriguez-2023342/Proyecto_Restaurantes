using System.Security.Cryptography;

namespace AuthService.Application.DTOs;

public class RegisterResponseDto
{
    public bool Success { get; set; } = false;
    public UserResponseDto User { get; set; } = new();
    public string Message { get; set; } = string.Empty;
    public bool IsEmailVerificationRequerid { get; set; } = true;
}
