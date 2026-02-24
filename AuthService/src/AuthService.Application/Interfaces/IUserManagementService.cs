using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    // Role management - ADMIN_ROLE only
    
    // User CRUD - USER_ROLE (own data), ADMIN_ROLE (any user)
    Task<UserResponseDto> UpdateUserByIdAsync(string userId, UpdateUserDto updateUserDto);
    Task<UserResponseDto> GetUserDetailsByIdAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> DeactivateUserAsync(string userId);
    
    // Profile picture upload
    Task<UserResponseDto> UploadProfilePictureAsync(string userId, IFileData profilePicture);

    // Admin create user (distinct from public register)
    Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto);
    
    // Permanent delete - ADMIN only
    Task<bool> DeleteUserAsync(string userId);
}
