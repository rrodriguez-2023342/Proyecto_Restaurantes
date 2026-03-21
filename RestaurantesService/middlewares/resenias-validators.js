import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validaciones para CREAR reseña (Solo USER_ROLE según la tabla)
export const validateCreateResenia = [
    validateJWT,
    requireRoles('USER_ROLE'),
    body('restaurante')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    body('comentario')
        .notEmpty()
        .withMessage('El comentario es obligatorio')
        .isLength({ max: 500 })
        .withMessage('El comentario no puede exceder los 500 caracteres'),
    body('calificacion')
        .notEmpty()
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser un número entre 1 y 5'),
    checkValidators
];

// Validaciones para VER reseñas (Todos pueden ver)
export const validateViewResenia = [
    validateJWT,
    requireRoles('USER_ROLE'),
    param('id').optional().isMongoId().withMessage('ID no válido'),
    checkValidators
];

// Validaciones para ACTUALIZAR reseña (ADMIN_ROLE y USER_ROLE "Solo la suya")
export const validateUpdateResenia = [
    validateJWT,
    requireRoles('USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reseña no válido'),
    body('comentario').optional().notEmpty(),
    body('calificacion').optional().isInt({ min: 1, max: 5 }),
    checkValidators
];

// Validaciones para ELIMINAR/OCULTAR (Todos los roles con sus restricciones)
export const validateDeleteResenia = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reseña no válido'),
    checkValidators
];
