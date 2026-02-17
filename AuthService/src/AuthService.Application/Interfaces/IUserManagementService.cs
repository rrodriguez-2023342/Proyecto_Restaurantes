using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

public interface IUserManagementService
{
    // solo ADMIN_ROLE 
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    
    // users CRUD - USER_ROLE (su info), ADMIN_ROLE (todo)
    Task<UserResponseDto> UpdateUserByIdAsync(string userId, UpdateUserDto updateUserDto);
    Task<UserResponseDto> GetUserDetailsByIdAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> DeactivateUserAsync(string userId);
    
    // cargar imagen
    Task<UserResponseDto> UploadProfilePictureAsync(string userId, IFileData profilePicture);

    // crear usuario
    Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto);
    
    // delete permanente ADMIN_ROLE
    Task<bool> DeleteUserAsync(string userId);
}
