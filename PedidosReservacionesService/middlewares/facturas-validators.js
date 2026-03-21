import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

export const validateCreateFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('pedido')
        .notEmpty().withMessage('El ID del pedido es requerido')
        .isMongoId().withMessage('El ID del pedido debe ser válido'),
    body('propina')
        .optional()
        .isFloat({ min: 0 }).withMessage('La propina debe ser válido y mayor o igual a 0'),
    body('correoCliente')
        .optional()
        .isEmail().withMessage('El correo del cliente debe ser un email válido'),
    // subtotal → se calcula desde DetallePedido en el controller
    // total    → se calcula en el pre-save hook del modelo
    checkValidators,
];

export const validateUpdateFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID de la factura es requerido')
        .isMongoId().withMessage('El ID de la factura debe ser válido'),
    body('pedido')
        .optional()
        .isMongoId().withMessage('El ID del pedido debe ser válido'),
    body('subtotal')
        .optional()
        .isFloat({ min: 0 }).withMessage('El subtotal debe ser válido y mayor o igual a 0'),
    body('propina')
        .optional()
        .isFloat({ min: 0 }).withMessage('La propina debe ser válido y mayor o igual a 0'),
    body('correoCliente')
        .optional()
        .isEmail().withMessage('El correo del cliente debe ser un email válido'),
    checkValidators,
];

export const validateDeleteFactura = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID de la factura es requerido')
        .isMongoId().withMessage('El ID de la factura debe ser válido'),
    checkValidators,
];

export const validateDescargarFacturaPdf = [
    validateJWT,
    param('id')
        .notEmpty().withMessage('El ID de la factura es requerido')
        .isMongoId().withMessage('El ID de la factura debe ser válido'),
    checkValidators,
];