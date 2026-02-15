import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validadores para crear facturas
export const validateCreateFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('pedido')
        .notEmpty()
        .withMessage('El ID del pedido es requerido')
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    body('subtotal')
        .notEmpty()
        .withMessage('El subtotal es requerido')
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser válido y mayor o igual a 0'),
    body('impuesto')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El impuesto debe ser válido y mayor o igual a 0'),
    body('total')
        .notEmpty()
        .withMessage('El total es requerido')
        .isFloat({ min: 0 })
        .withMessage('El total debe ser válido y mayor o igual a 0'),
    checkValidators,
];
