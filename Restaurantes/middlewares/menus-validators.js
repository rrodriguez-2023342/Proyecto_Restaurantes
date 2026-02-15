import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear menus
export const validateCreateMenu = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('restaurante')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('nombreMenu')
        .trim()
        .notEmpty()
        .withMessage('El nombre del menú es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionMenu')
        .trim()
        .notEmpty()
        .withMessage('La descripción del menú es requerida')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    checkValidators,
];

export const validateUpdateMenu = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del menú es requerido')
        .isMongoId()
        .withMessage('El ID del menú debe ser válido'),
    body('restaurante')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('nombreMenu')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionMenu')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    checkValidators,
];

export const validateDeleteMenu = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del menú es requerido')
        .isMongoId()
        .withMessage('El ID del menú debe ser válido'),
    checkValidators,
];
