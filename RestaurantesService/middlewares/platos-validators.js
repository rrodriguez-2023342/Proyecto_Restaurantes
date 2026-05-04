import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { attachRestaurant } from './attach-restaurante.js';

//Aca el USER_ROLE puede ver los platos activos.

// Validaciones para CREAR platos (Solo Admins)
export const validateCreatePlato = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('menu')
        .notEmpty()
        .withMessage('El ID del menú es obligatorio')
        .isMongoId()
        .withMessage('ID de menú no válido'),
    body('nombrePlato')
        .trim()
        .notEmpty()
        .withMessage('El nombre del plato es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionPlato')
        .trim()
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor o igual a 0'),
    body('tipoPlato')
        .notEmpty()
        .withMessage('El tipo de plato es obligatorio')
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('Tipo de plato no válido'),
    body('disponible')
        .optional()
        .custom(value => {
            if (typeof value === 'boolean') return true;
            if (typeof value === 'string' && ['true', 'false'].includes(value)) return true;
            throw new Error('disponible debe ser true o false');
        }),
    checkValidators
];

// Validaciones para ACTUALIZAR platos (Solo Admins)
export const validateUpdatePlato = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de plato no válido'),
    body('nombrePlato')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionPlato')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('precio')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor o igual a 0'),
    body('tipoPlato')
        .optional()
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('Tipo de plato no válido'),
    body('disponible')
        .optional()
        .custom(value => {
            if (typeof value === 'boolean') return true;
            if (typeof value === 'string' && ['true', 'false'].includes(value)) return true;
            throw new Error('disponible debe ser true o false');
        }),
    checkValidators
];

// Validaciones para VER platos (Admins y Clientes)
export const validateViewPlato = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    query('menu')
        .if((value, { req }) => !req.params.id)
        .notEmpty()
        .withMessage('El ID del menu es obligatorio para listar platos')
        .bail()
        .isMongoId()
        .withMessage('ID de menu no valido'),
    param('id')
        .optional()
        .isMongoId()
        .withMessage('ID de plato no válido'),
    checkValidators
];

// Validaciones para ELIMINAR platos (Solo Admins)
export const validateDeletePlato = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de plato no válido'),
    checkValidators
];
