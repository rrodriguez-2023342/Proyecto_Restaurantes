import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

const isTodayOrFuture = (value) => {
    const selectedDate = new Date(value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
};

// Validaciones para CREAR reservacion. La cantidad de personas se calcula desde la mesa.
export const validateCreateReservacion = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('restaurante')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de restaurante no valido'),
    body('mesa')
        .notEmpty()
        .isMongoId()
        .withMessage('ID de mesa no valido'),
    body('fecha')
        .notEmpty()
        .isISO8601()
        .withMessage('Fecha no valida (formato ISO8601 requerido)')
        .bail()
        .custom(isTodayOrFuture)
        .withMessage('No se pueden crear reservaciones en fechas anteriores'),
    body('cantidadPersonas')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('La cantidad de personas debe estar entre 1 y 12'),
    checkValidators
];

// Validaciones para VER reservaciones
export const validateViewReservaciones = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    checkValidators
];

// Validaciones para ACTUALIZAR reservacion
// El controlador verificara si esta "PENDIENTE" para el USER_ROLE
export const validateUpdateReservacion = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reservacion no valido'),
    body('fecha')
        .optional()
        .isISO8601()
        .bail()
        .custom(isTodayOrFuture)
        .withMessage('No se pueden crear reservaciones en fechas anteriores'),
    body('cantidadPersonas')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('La cantidad de personas debe estar entre 1 y 12'),
    body('estado')
        .optional()
        .isIn(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
        .withMessage('Estado de reservacion no valido'),
    checkValidators
];

// Validaciones para CANCELAR/ELIMINAR
export const validateDeleteReservacion = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reservacion no valido'),
    checkValidators
];
