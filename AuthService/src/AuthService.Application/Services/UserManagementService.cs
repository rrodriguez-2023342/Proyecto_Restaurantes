using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles, ICloudinaryService cloudinary, IPasswordHashService passwordHashService, IEmailService emailService) : IUserManagementService
{
    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("ID de usuario inválido", nameof(userId));
        if (!RoleConstants.AllowedRole.Contains(roleName))
            throw new InvalidOperationException($"Rol no permitido. Usa {RoleConstants.ADMIN_ROLE} o {RoleConstants.USER_ROLE}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);

        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE);
        if (isUserAdmin && roleName != RoleConstants.ADMIN_ROLE)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("No se puede remover el último administrador");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"El rol {roleName} no fue encontrado");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        // Map to response
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = role.Name,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreateAt,
            UpdatedAt = user.UpdateAt
        };
    }

    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        if (createUserDto == null) throw new ArgumentNullException(nameof(createUserDto));

        // Normalize
        var email = createUserDto.Email.Trim().ToLowerInvariant();
        var username = createUserDto.Username.Trim();
        var roleName = (createUserDto.Role ?? RoleConstants.USER_ROLE).Trim().ToUpperInvariant();

        // Validate unique email/username
        if (await users.ExistsByEmailAsync(email))
            throw new InvalidOperationException("El email ya está en uso");

        if (await users.ExistsByUsernameAsync(username))
            throw new InvalidOperationException("El nombre de usuario ya está en uso");

        // Resolve role
        if (!RoleConstants.AllowedRole.Contains(roleName))
            throw new InvalidOperationException($"Rol no permitido. Usa {RoleConstants.ADMIN_ROLE} o {RoleConstants.USER_ROLE}");

        var roleEntity = await roles.GetByNameAsync(roleName)
                         ?? throw new InvalidOperationException($"El rol {roleName} no fue encontrado");

        // Generate IDs
        var userId = UuidGenerator.GenerateUserId();
        var profileId = UuidGenerator.GenerateUserId();
        var emailId = UuidGenerator.GenerateUserId();

        // Build user entity (admin-created users are active and email-verified by default)
        var user = new User
        {
            Id = userId,
            Name = createUserDto.Name,
            Surname = createUserDto.Surname,
            Username = username,
            Email = email,
            Password = passwordHashService.HashPassword(createUserDto.Password),
            Status = true,
            UserProfile = new UserProfile
            {
                Id = profileId,
                UserId = userId,
                ProfilePicture = cloudinary.GetDefaultAvantarUrl(),
                Phone = createUserDto.Phone ?? string.Empty
            },
            UserEmail = new UserEmail
            {
                Id = emailId,
                UserId = userId,
                EmailVerified = true,
                EmailVerificationToken = null,
                EmailVerificationTokenExpiry = null
            },
            UserRoles = [
                new UserRole
                {
                    Id = UuidGenerator.GenerateUserId(),
                    UserId = userId,
                    RoleId = roleEntity.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            ],
            UserPasswordReset = new UserPasswordReset
            {
                Id = UuidGenerator.GenerateUserId(),
                UserId = userId,
                PasswordResetToken = null,
                PasswordResetTokenExpiry = null
            }
        };

        var created = await users.CreateAsync(user);

        // Enviar email con credenciales (no bloquear la respuesta)
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendCredentialsEmailAsync(created.Email, created.Username, createUserDto.Password);
                await emailService.SendWelcomeEmailAsync(created.Email, created.Username);
            }
            catch (Exception)
            {
                // Ignorar errores de envío de correo (no bloquear la creación)
            }
        });

        return new UserResponseDto
        {
            Id = created.Id,
            Name = created.Name,
            Surname = created.Surname,
            Username = created.Username,
            Email = created.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(created.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = created.UserProfile?.Phone ?? string.Empty,
            Role = roleEntity.Name,
            Status = created.Status,
            IsEmailVerified = created.UserEmail?.EmailVerified ?? false,
            CreatedAt = created.CreateAt,
            UpdatedAt = created.UpdateAt
        };
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNameAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(u.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = u.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt = u.CreateAt,
            UpdatedAt = u.UpdateAt
        }).ToList();
    }

    public async Task<UserResponseDto> UpdateUserByIdAsync(string userId, UpdateUserDto updateUserDto)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("ID de usuario inválido", nameof(userId));

        var user = await users.GetByIdAsync(userId);

        // Update user properties
        if (!string.IsNullOrWhiteSpace(updateUserDto.Name))
            user.Name = updateUserDto.Name;

        if (!string.IsNullOrWhiteSpace(updateUserDto.Surname))
            user.Surname = updateUserDto.Surname;

        // Update user profile
        if (user.UserProfile != null)
        {
            if (!string.IsNullOrWhiteSpace(updateUserDto.ProfilePicture))
                user.UserProfile.ProfilePicture = updateUserDto.ProfilePicture;

            if (!string.IsNullOrWhiteSpace(updateUserDto.Phone))
                user.UserProfile.Phone = updateUserDto.Phone;
        }

        user.UpdateAt = DateTime.UtcNow;
        await users.UpdateAsync(user);

        // Get updated user with role
        var userRoles = await roles.GetUserRoleNameAsync(userId);
        var roleName = userRoles.FirstOrDefault() ?? RoleConstants.USER_ROLE;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreateAt,
            UpdatedAt = user.UpdateAt
        };
    }

    public async Task<UserResponseDto> GetUserDetailsByIdAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("ID de usuario inválido", nameof(userId));

        var user = await users.GetByIdAsync(userId);
        var userRoles = await roles.GetUserRoleNameAsync(userId);
        var roleName = userRoles.FirstOrDefault() ?? RoleConstants.USER_ROLE;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreateAt,
            UpdatedAt = user.UpdateAt
        };
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllUsersAsync()
    {
        var allUsers = await users.GetAllAsync();
        var usersDto = new List<UserResponseDto>();

        foreach (var user in allUsers)
        {
            var userRoles = await roles.GetUserRoleNameAsync(user.Id);
            var roleName = userRoles.FirstOrDefault() ?? RoleConstants.USER_ROLE;

            usersDto.Add(new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
                Phone = user.UserProfile?.Phone ?? string.Empty,
                Role = roleName,
                Status = user.Status,
                IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
                CreatedAt = user.CreateAt,
                UpdatedAt = user.UpdateAt
            });
        }

        return usersDto.AsReadOnly();
    }

    public async Task<UserResponseDto> DeactivateUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("ID de usuario inválido", nameof(userId));

        var user = await users.GetByIdAsync(userId);

        // Prevent deactivating the last admin
        if (user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE))
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);
            if (adminCount <= 1)
                throw new InvalidOperationException("No se puede desactivar el último administrador");
        }

        user.Status = false;
        user.UpdateAt = DateTime.UtcNow;
        await users.UpdateAsync(user);

        var userRoles = await roles.GetUserRoleNameAsync(userId);
        var roleName = userRoles.FirstOrDefault() ?? RoleConstants.USER_ROLE;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreateAt,
            UpdatedAt = user.UpdateAt
        };
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("ID de usuario inválido", nameof(userId));

        var user = await users.GetByIdAsync(userId);

        // Prevent deleting the last admin
        if (user.UserRoles.Any(r => r.Role.Name == RoleConstants.ADMIN_ROLE))
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.ADMIN_ROLE);
            if (adminCount <= 1)
                throw new InvalidOperationException("No se puede eliminar el último administrador");
        }

        var deleted = await users.DeleteAsync(userId);
        return deleted;
    }

    public async Task<UserResponseDto> UploadProfilePictureAsync(string userId, IFileData profilePicture)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("ID de usuario inválido", nameof(userId));

        if (profilePicture == null || profilePicture.Size == 0)
            throw new ArgumentException("No se proporcionó ningún archivo", nameof(profilePicture));

        // Validar tipo de archivo
        var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedMimeTypes.Contains(profilePicture.ContentType))
            throw new InvalidOperationException("El archivo debe ser una imagen (JPG, PNG, WEBP o GIF)");

        // Validar tamaño (máximo 5MB)
        if (profilePicture.Size > 5 * 1024 * 1024)
            throw new InvalidOperationException("La imagen no puede exceder 5MB");

        var user = await users.GetByIdAsync(userId);

        // Subir a Cloudinary
        var uploadResult = await cloudinary.UploadImageAsync(profilePicture, profilePicture.FileName);

        // Actualizar perfil del usuario
        if (user.UserProfile != null)
        {
            user.UserProfile.ProfilePicture = uploadResult;
        }

        user.UpdateAt = DateTime.UtcNow;
        await users.UpdateAsync(user);

        // Retornar usuario actualizado
        var userRoles = await roles.GetUserRoleNameAsync(userId);
        var roleName = userRoles.FirstOrDefault() ?? RoleConstants.USER_ROLE;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            ProfilePicture = cloudinary.GetFullImageUrl(user.UserProfile?.ProfilePicture ?? string.Empty),
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreateAt,
            UpdatedAt = user.UpdateAt
        };
    }
}


