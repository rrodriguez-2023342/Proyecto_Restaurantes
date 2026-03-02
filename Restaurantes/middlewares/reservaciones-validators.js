import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validaciones para CREAR reservación (Todos los roles estan permitidos para crear reservaciones.)
export const validateCreateReservacion = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('restaurante')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    body('mesa')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de mesa no válido'),
    body('fecha')
        .notEmpty()
        .isISO8601()
        .withMessage('Fecha no válida (formato ISO8601 requerido)'),
    body('cantidadPersonas')
        .notEmpty()
        .isInt({ min: 1 })
        .withMessage('La cantidad de personas debe ser al menos 1'),
    checkValidators
];

// Validaciones para VER reservaciones
export const validateViewReservaciones = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    checkValidators
];

// Validaciones para ACTUALIZAR reservación
// El controlador verificará si está "PENDIENTE" para el USER_ROLE
export const validateUpdateReservacion = [
    validateJWT,
    requireRoles('ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reservación no válido'),
    body('fecha').optional().isISO8601(),
    body('cantidadPersonas').optional().isInt({ min: 1 }),
    body('estado')
        .optional()
        .isIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
        .withMessage('Estado de reservación no válido'),
    checkValidators
];

// Validaciones para CANCELAR/ELIMINAR
export const validateDeleteReservacion = [
    validateJWT,
    requireRoles('ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reservación no válido'),
    checkValidators
];
