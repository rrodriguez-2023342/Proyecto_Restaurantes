import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validaciones para CREAR restaurante (Solo ADMIN_ROLE)
export const validateCreateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    body('nombre')
        .notEmpty()
        .withMessage('El nombre del restaurante es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder los 100 caracteres'),
    body('direccion')
        .notEmpty()
        .withMessage('La dirección es obligatoria'),
    body('telefono')
        .notEmpty()
        .withMessage('El teléfono es obligatorio'),
    checkValidators
];

// Validaciones para VER restaurantes
export const validateViewRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id').optional().isMongoId().withMessage('ID de restaurante no válido'),
    checkValidators
];

// Validaciones para ACTUALIZAR restaurante
export const validateUpdateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    body('nombre').optional().notEmpty(),
    body('direccion').optional().notEmpty(),
    body('telefono').optional().notEmpty(),
    checkValidators
];

// Validaciones para ELIMINAR restaurante (Solo ADMIN_ROLE)
export const validateDeleteRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    checkValidators
];