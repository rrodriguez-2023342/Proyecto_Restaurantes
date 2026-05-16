import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { findUserById, getAllUsers, createUserByAdmin, updateUserByAdmin, deleteUser, deactivateUserAccount } from '../../helpers/user-db.js';
import {
    getUserRoleNames,
    getUsersByRole as repoGetUsersByRole,
    setUserSingleRole,
} from '../../helpers/role-db.js';
import { ALLOWED_ROLES, ADMIN_ROLE } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';
import { uploadImage } from '../../helpers/cloudinary-service.js';
import {
    sendAccountCreatedByAdminEmail,
    sendAccountDeletedEmail,
    sendAccountDeactivatedByAdminEmail,
    sendAccountUpdatedByAdminEmail,
} from '../../helpers/email-service.js';

const ensureAdmin = async (req) => {
    const currentUserId = req.userId;
    if (!currentUserId) return { allowed: false, reason: 'Token invalido o no proporcionado' };

    const roles =
        req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean) ??
        (await getUserRoleNames(currentUserId));

    if (!roles.includes(ADMIN_ROLE)) {
        return { allowed: false, reason: 'Permisos insuficientes. Se requiere rol de administrador' };
    }

    return { allowed: true };
};

const isOtherAdminUser = async (targetUserId, currentUserId) => {
    if (String(targetUserId) === String(currentUserId)) return false;
    const roles = await getUserRoleNames(targetUserId);
    return roles.includes(ADMIN_ROLE);
};

export const updateUserRole = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }

        const { userId } = req.params;
        const { roleName } = req.body || {};

        // No puede cambiarse el rol a si mismo
        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: 'No puedes cambiar tu propio rol',
            });
        }

        const normalized = (roleName || '').trim().toUpperCase();
        if (!ALLOWED_ROLES.includes(normalized)) {
            return res.status(400).json({
                success: false,
                message: 'Rol no permitido. Usa ADMIN_ROLE o USER_ROLE',
            });
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (await isOtherAdminUser(userId, req.userId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes modificar a otro administrador',
            });
        }

        const { updatedUser } = await setUserSingleRole(user, normalized, sequelize);

        return res.status(200).json(buildUserResponse(updatedUser));
    }),
];

export const getUserRoles = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const { userId } = req.params;

        // Si no es su propio perfil, debe ser admin
        if (userId !== req.userId) {
            const auth = await ensureAdmin(req);
            if (!auth.allowed) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver los roles de otro usuario',
                });
            }
        }

        const roles = await getUserRoleNames(userId);
        return res.status(200).json(roles);
    }),
];

export const getUsersByRole = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }

        const { roleName } = req.params;
        const normalized = (roleName || '').trim().toUpperCase();
        if (!ALLOWED_ROLES.includes(normalized)) {
            return res.status(400).json({
                success: false,
                message: 'Rol no permitido. Usa ADMIN_ROLE o USER_ROLE',
            });
        }

        const users = await repoGetUsersByRole(normalized);
        const payload = users.map(buildUserResponse);
        return res.status(200).json(payload);
    }),
];

// get all users - solo admin
export const listAllUsers = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }
        const users = await getAllUsers();
        return res.status(200).json(users.map(buildUserResponse));
    }),
];

// get user by id - admin ve cualquiera, user_role solo el suyo
export const getUserById = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const { userId } = req.params;

        // Si no es su propio perfil, debe ser admin
        if (userId !== req.userId) {
            const auth = await ensureAdmin(req);
            if (!auth.allowed) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver el perfil de otro usuario',
                });
            }
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        return res.status(200).json(buildUserResponse(user));
    }),
];

// create user - solo admin
export const createUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }

        const { name, surname, username, email, password, phone, roleName } = req.body;

        if (!name || !surname || !username || !email || !password || !phone || !roleName) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos: name, surname, username, email, password, phone, roleName',
            });
        }

        const normalized = roleName.trim().toUpperCase();
        if (!ALLOWED_ROLES.includes(normalized)) {
            return res.status(400).json({
                success: false,
                message: 'Rol no permitido. Usa ADMIN_ROLE o USER_ROLE',
            });
        }

        let profilePictureToStore = null;
        if (req.file) {
            try {
                profilePictureToStore = await uploadImage(req.file.path, req.file.filename);
            } catch (err) {
                console.error('Error al subir imagen a Cloudinary:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al subir la imagen de perfil',
                    error: err.message
                });
            }
        }

        const newUser = await createUserByAdmin({
            name, surname, username, email, password, phone,
            profilePicture: profilePictureToStore,
            roleName: normalized,
        });

        Promise.resolve()
            .then(() => sendAccountCreatedByAdminEmail(email, name, password))
            .catch((err) => console.error('Error enviando correo de cuenta creada:', err));

        return res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: buildUserResponse(newUser),
        });
    }),
];

// update user - admin puede editar cualquiera; cada usuario puede editar su propio perfil
export const updateUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const { userId } = req.params;
        const { name, surname, phone, roleName } = req.body;
        const isOwnProfile = userId === req.userId;

        console.log(`[UpdateUser] Iniciando actualización para ID: ${userId}`);
        console.log(`[UpdateUser] Datos recibidos:`, { name, surname, phone, roleName, hasFile: !!req.file });

        if (!isOwnProfile) {
            const auth = await ensureAdmin(req);
            if (!auth.allowed) {
                return res.status(403).json({ success: false, message: auth.reason });
            }
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (await isOtherAdminUser(userId, req.userId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes editar a otro administrador',
            });
        }

        // Si viene un rol y no es el suyo propio, actualizarlo
        if (roleName && !isOwnProfile) {
            const normalized = roleName.trim().toUpperCase();
            if (ALLOWED_ROLES.includes(normalized)) {
                await setUserSingleRole(user, normalized, sequelize);
            }
        }

        let profilePictureToStore = user.UserProfile?.ProfilePicture;
        if (req.file) {
            try {
                console.log(`[UpdateUser] Subiendo nueva imagen a Cloudinary...`);
                profilePictureToStore = await uploadImage(req.file.path, req.file.filename);
                console.log(`[UpdateUser] Nueva URL de imagen: ${profilePictureToStore}`);
            } catch (err) {
                console.error('[UpdateUser] Error al subir imagen a Cloudinary:', err);
            }
        }

        try {
            await updateUserByAdmin(userId, {
                name: name !== undefined ? name : user.Name,
                surname: surname !== undefined ? surname : user.Surname,
                phone: phone !== undefined ? phone : (user.UserProfile ? user.UserProfile.Phone : null),
                profilePicture: profilePictureToStore,
            });
            console.log(`[UpdateUser] Actualización en DB completada con éxito.`);
        } catch (dbError) {
            console.error(`[UpdateUser] Error crítico al guardar en DB:`, dbError);
            return res.status(500).json({ success: false, message: 'Error interno al guardar cambios en base de datos' });
        }

        // Notificar por correo (opcional, no bloqueante)
        sendAccountUpdatedByAdminEmail(user.Email, user.Name, { name, surname, phone })
            .catch((err) => console.error('[UpdateUser] Error enviando correo:', err));

        const updatedUser = await findUserById(userId);
        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: buildUserResponse(updatedUser),
        });
    }),
];

// delete user - solo admin
export const deleteUserById = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }

        const { userId } = req.params;

        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta',
            });
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (await isOtherAdminUser(userId, req.userId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes eliminar a otro administrador',
            });
        }

        const userEmail = user.Email;
        const userName = user.Name;

        await deleteUser(userId);

        Promise.resolve()
            .then(() => sendAccountDeletedEmail(userEmail, userName))
            .catch((err) => console.error('Error enviando correo de cuenta eliminada:', err));

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente',
        });
    }),
];

// deactivate user - solo admin
export const adminDeactivateUser = [
    validateJWT,
    asyncHandler(async (req, res) => {
        const auth = await ensureAdmin(req);
        if (!auth.allowed) {
            return res.status(403).json({ success: false, message: auth.reason });
        }

        const { userId } = req.params;

        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: 'No puedes desactivar tu propia cuenta',
            });
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (await isOtherAdminUser(userId, req.userId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes desactivar a otro administrador',
            });
        }

        if (!user.Status) {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está desactivada',
            });
        }

        await deactivateUserAccount(userId);

        Promise.resolve()
            .then(() => sendAccountDeactivatedByAdminEmail(user.Email, user.Name))
            .catch((err) => console.error('Error enviando correo de cuenta desactivada:', err));

        return res.status(200).json({
            success: true,
            message: 'Cuenta desactivada exitosamente',
        });
    }),
];
