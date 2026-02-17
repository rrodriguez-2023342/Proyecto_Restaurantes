import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear detalle pedidos
export const validateCreateDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('pedido')
        .notEmpty()
        .withMessage('El ID del pedido es requerido')
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    body('plato')
        .notEmpty()
        .withMessage('El ID del plato es requerido')
        .isMongoId()
        .withMessage('El ID del plato debe ser válido'),
    body('cantidad')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser mayor a 0'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser válido y mayor o igual a 0'),
    checkValidators,
];

export const validateUpdateDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del detalle de pedido es requerido')
        .isMongoId()
        .withMessage('El ID del detalle de pedido debe ser válido'),
    body('pedido')
        .optional()
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    body('plato')
        .optional()
        .isMongoId()
        .withMessage('El ID del plato debe ser válido'),
    body('cantidad')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser mayor a 0'),
    body('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser válido y mayor o igual a 0'),
    checkValidators,
];

export const validateDeleteDetallePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del detalle de pedido es requerido')
        .isMongoId()
        .withMessage('El ID del detalle de pedido debe ser válido'),
    checkValidators,
];
