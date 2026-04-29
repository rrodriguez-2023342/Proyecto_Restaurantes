import { Router } from 'express';
import {
    updateUserRole,
    getUserRoles,
    getUsersByRole,
    listAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUserById,
    adminDeactivateUser,
} from './user.controller.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';

import { validateRegister } from '../../middlewares/validation.js';

const router = Router();

// roles
router.put('/:userId/role', ...updateUserRole);
router.get('/:userId/roles', ...getUserRoles);
router.get('/by-role/:roleName', ...getUsersByRole);

// admin
router.get('/', ...listAllUsers);
router.post('/', upload.single('profilePicture'), handleUploadError, validateRegister, ...createUser);
router.patch('/deactivate/:userId', ...adminDeactivateUser);
router.put('/:userId', upload.single('profilePicture'), handleUploadError, ...updateUser);
router.delete('/:userId', ...deleteUserById);
router.get('/:userId', ...getUserById);

export default router;
