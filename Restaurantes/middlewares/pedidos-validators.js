import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear pedidos
export const validateCreatePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    body('restaurante')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('plato')
        .notEmpty()
        .withMessage('El ID del plato es requerido')
        .isMongoId()
        .withMessage('El ID del plato debe ser válido'),
    body('cantidad')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un entero mayor o igual a 1'),
    // usuario no se valida porque se establece a partir del token
    body('tipoPedido')
        .notEmpty()
        .withMessage('El tipo de pedido es requerido')
        .isIn(['Domicilio', 'Para llevar', 'En el restaurante'])
        .withMessage('El tipo de pedido debe ser: Domicilio, Para llevar o En el restaurante'),
    body('totalPedido')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El total debe ser válido y mayor o igual a 0'),
    checkValidators,
];

export const validateUpdatePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del pedido es requerido')
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    body('restaurante')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser válido'),
    body('plato')
        .optional()
        .isMongoId()
        .withMessage('El ID del plato debe ser válido'),
    body('cantidad')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un entero mayor o igual a 1'),
    body('tipoPedido')
        .optional()
        .isIn(['Domicilio', 'Para llevar', 'En el restaurante'])
        .withMessage('El tipo de pedido debe ser: Domicilio, Para llevar o En el restaurante'),
    body('totalPedido')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El total debe ser válido y mayor o igual a 0'),
    checkValidators,
];

export const validateDeletePedido = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del pedido es requerido')
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    checkValidators,
];
