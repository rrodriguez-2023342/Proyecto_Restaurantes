import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

export const validateCreateDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('pedido')
        .notEmpty().withMessage('El ID del pedido es requerido')
        .isMongoId().withMessage('El ID del pedido debe ser válido'),
    body('items')
        .isArray({ min: 1 }).withMessage('Debes enviar al menos un plato en items[]'),
    body('items.*.plato')
        .notEmpty().withMessage('Cada item debe tener un ID de plato')
        .isMongoId().withMessage('El ID de cada plato debe ser válido'),
    body('items.*.cantidad')
        .notEmpty().withMessage('Cada item debe tener una cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad de cada item debe ser mayor a 0'),
    checkValidators,
];

export const validateUpdateDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID del detalle de pedido es requerido')
        .isMongoId().withMessage('El ID del detalle de pedido debe ser válido'),
    body('cantidad')
        .optional()
        .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    checkValidators,
];

export const validateDeleteDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID del detalle de pedido es requerido')
        .isMongoId().withMessage('El ID del detalle de pedido debe ser válido'),
    checkValidators,
];