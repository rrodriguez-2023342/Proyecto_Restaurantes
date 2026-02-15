import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear inventario
export const validateCreateInventario = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('restaurante')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('nombreItem')
        .trim()
        .notEmpty()
        .withMessage('El nombre del item es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('cantidad')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 0 })
        .withMessage('La cantidad debe ser mayor o igual a 0'),
    body('minStock')
        .notEmpty()
        .withMessage('El stock mínimo es requerido')
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser mayor o igual a 0'),
    checkValidators,
];

export const validateUpdateInventario = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del inventario es requerido')
        .isMongoId()
        .withMessage('El ID del inventario debe ser válido'),
    body('restaurante')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('nombreItem')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('cantidad')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La cantidad debe ser mayor o igual a 0'),
    body('minStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser mayor o igual a 0'),
    checkValidators,
];

export const validateDeleteInventario = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del inventario es requerido')
        .isMongoId()
        .withMessage('El ID del inventario debe ser válido'),
    checkValidators,
];
