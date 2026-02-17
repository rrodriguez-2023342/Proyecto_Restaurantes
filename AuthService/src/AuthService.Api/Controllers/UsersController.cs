using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Api.Models;
using AuthService.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace AuthService.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController(IUserManagementService userManagementService) : ControllerBase
{
    [HttpGet("{userId}")]
    [Authorize(Roles = $"{RoleConstants.USER_ROLE},{RoleConstants.ADMIN_ROLE}")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> GetUserById(string userId)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (currentUserRole == RoleConstants.USER_ROLE && currentUserId != userId)
        {
            return Forbid("Los usuarios solo pueden ver su propio perfil");
        }

        var user = await userManagementService.GetUserDetailsByIdAsync(userId);
        return Ok(user);
    }
    [HttpGet]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetAllUsers()
    {
        var users = await userManagementService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] CreateUserDto dto)
    {
        var created = await userManagementService.CreateUserAsync(dto);
        return CreatedAtAction(nameof(GetUserById), new { userId = created.Id }, created);
    }

    [HttpPut("{userId}")]
    [Authorize(Roles = $"{RoleConstants.USER_ROLE},{RoleConstants.ADMIN_ROLE}")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> UpdateUserById(string userId, [FromBody] UpdateUserDto dto)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (currentUserRole == RoleConstants.USER_ROLE && currentUserId != userId)
        {
            return Forbid("Los usuarios solo pueden actualizar su propio perfil");
        }

        var result = await userManagementService.UpdateUserByIdAsync(userId, dto);
        return Ok(result);
    }

    [HttpDelete("{userId}")]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> DeactivateUser(string userId)
    {
        var result = await userManagementService.DeactivateUserAsync(userId);
        return Ok(result);
    }
    
    [HttpDelete("{userId}-delete")]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult> DeleteUserPermanent(string userId)
    {
        var deleted = await userManagementService.DeleteUserAsync(userId);
        if (deleted)
        {
            return Ok(new { success = true, message = "Usuario eliminado permanentemente", data = new { userId } });
        }

        return StatusCode(500, new { success = false, message = "No se pudo eliminar el usuario" });
    }

    [HttpPut("{userId}/role")]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto dto)
    {
        var result = await userManagementService.UpdateUserRoleAsync(userId, dto.RoleName);
        return Ok(result);
    }

    [HttpGet("{userId}/roles")]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetUserRoles(string userId)
    {
        var roles = await userManagementService.GetUserRolesAsync(userId);
        return Ok(roles);
    }


    [HttpPost("{userId}/profile-picture")]
    [Authorize(Roles = $"{RoleConstants.USER_ROLE},{RoleConstants.ADMIN_ROLE}")]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<UserResponseDto>> UploadProfilePicture(string userId, IFormFile profilePicture)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (currentUserRole == RoleConstants.USER_ROLE && currentUserId != userId)
        {
            return Forbid("Los usuarios solo pueden subir su propia foto de perfil");
        }

        var fileAdapter = new FormFileAdapter(profilePicture);
        var result = await userManagementService.UploadProfilePictureAsync(userId, fileAdapter);
        return Ok(result);
    }

    [HttpGet("by-role/{roleName}")]
    [Authorize(Roles = RoleConstants.ADMIN_ROLE)]
    [EnableRateLimiting("ApiPolicy")]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetUsersByRole(string roleName)
    {
        var users = await userManagementService.GetUsersByRoleAsync(roleName);
        return Ok(users);
    }
}


