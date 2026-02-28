import { body, param } from 'express-validator';
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
    body('impuesto')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El impuesto debe ser válido y mayor o igual a 0'),
    // subtotal → se calcula desde los DetallePedido en el controller
    // total    → se calcula en el pre-save hook del modelo
    checkValidators,
];

export const validateUpdateFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la factura es requerido')
        .isMongoId()
        .withMessage('El ID de la factura debe ser válido'),
    body('pedido')
        .optional()
        .isMongoId()
        .withMessage('El ID del pedido debe ser válido'),
    body('subtotal')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser válido y mayor o igual a 0'),
    body('impuesto')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El impuesto debe ser válido y mayor o igual a 0'),
    body('total')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El total debe ser válido y mayor o igual a 0'),
    checkValidators,
];

export const validateDeleteFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID de la factura es requerido')
        .isMongoId()
        .withMessage('El ID de la factura debe ser válido'),
    checkValidators,
];
