import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

export const validateCreatePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('restaurante')
        .notEmpty().withMessage('El ID del restaurante es requerido')
        .isMongoId().withMessage('El ID del restaurante debe ser válido'),
    body('tipoPedido')
        .notEmpty().withMessage('El tipo de pedido es requerido')
        .isIn(['Domicilio', 'Para llevar', 'En el restaurante'])
        .withMessage('El tipo de pedido debe ser: Domicilio, Para llevar o En el restaurante'),
    checkValidators,
];

export const validateUpdatePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID del pedido es requerido')
        .isMongoId().withMessage('El ID del pedido debe ser válido'),
    body('restaurante')
        .optional()
        .isMongoId().withMessage('El ID del restaurante debe ser válido'),
    body('tipoPedido')
        .optional()
        .isIn(['Domicilio', 'Para llevar', 'En el restaurante'])
        .withMessage('El tipo de pedido debe ser: Domicilio, Para llevar o En el restaurante'),
    body('estadoPedido')
        .optional()
        .isIn(['Pendiente', 'En preparación', 'Listo para entrega', 'Entregado', 'Cancelado'])
        .withMessage('Estado de pedido no válido'),
    checkValidators,
];

export const validateDeletePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID del pedido es requerido')
        .isMongoId().withMessage('El ID del pedido debe ser válido'),
    checkValidators,
];

export const validateViewPedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .optional()
        .isMongoId().withMessage('El ID del pedido debe ser valido'),
    checkValidators,
];
