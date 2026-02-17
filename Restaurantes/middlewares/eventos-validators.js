import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear eventos
export const validateCreateEvento = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('restaurante')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('titulo')
        .trim()
        .notEmpty()
        .withMessage('El título del evento es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El título debe tener entre 3 y 100 caracteres'),
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    body('fechaEvento')
        .notEmpty()
        .withMessage('La fecha del evento es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser válida'),
    checkValidators,
];

export const validateUpdateEvento = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del evento es requerido')
        .isMongoId()
        .withMessage('El ID del evento debe ser válido'),
    body('restaurante')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('titulo')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El título debe tener entre 3 y 100 caracteres'),
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    body('fechaEvento')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe ser válida'),
    checkValidators,
];

export const validateDeleteEvento = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del evento es requerido')
        .isMongoId()
        .withMessage('El ID del evento debe ser válido'),
    checkValidators,
];
