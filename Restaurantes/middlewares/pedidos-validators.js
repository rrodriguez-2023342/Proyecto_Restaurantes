import { body } from 'express-validator';
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
    body('tipoPedido')
        .notEmpty()
        .withMessage('El tipo de pedido es requerido')
        .isIn(['Domicilio', 'Para llevar', 'En el restaurante'])
        .withMessage('El tipo de pedido debe ser: Domicilio, Para llevar o En el restaurante'),
    body('totalPedido')
        .notEmpty()
        .withMessage('El total del pedido es requerido')
        .isFloat({ min: 0 })
        .withMessage('El total debe ser válido y mayor o igual a 0'),
    checkValidators,
];
