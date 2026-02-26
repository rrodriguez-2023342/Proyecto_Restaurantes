import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

//Aca el USER_ROLE puede ver los platos activos.

// Validaciones para CREAR platos (Solo Admins)
export const validateCreatePlato = [
    validateJWT, 
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('menu')
        .notEmpty()
        .withMessage('El ID del menú es obligatorio')
        .isMongoId()
        .withMessage('ID de menú no válido'),
    body('nombrePlato')
        .notEmpty()
        .withMessage('El nombre del plato es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder los 100 caracteres'),
    body('descripcionPlato')
        .notEmpty()
        .withMessage('La descripción es obligatoria'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor o igual a 0'),
    body('tipoPlato')
        .notEmpty()
        .withMessage('El tipo de plato es obligatorio')
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('Tipo de plato no válido'),
    checkValidators
];

// Validaciones para ACTUALIZAR platos (Solo Admins)
export const validateUpdatePlato = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de plato no válido'),
    body('nombrePlato').optional().notEmpty(),
    body('precio').optional().isFloat({ min: 0 }),
    body('disponible').optional().isBoolean(),
    checkValidators
];

// Validaciones para VER platos (Admins y Clientes)
export const validateViewPlato = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .optional()
        .isMongoId()
        .withMessage('ID de plato no válido'),
    checkValidators
];

// Validaciones para ELIMINAR platos (Solo Admins)
export const validateDeletePlato = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de plato no válido'),
    checkValidators
];