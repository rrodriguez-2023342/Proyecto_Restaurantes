import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { attachRestaurant } from './attach-restaurante.js';

// USER_ROLE queda excluido no puede modificar nada como decia en la tabla solo 
// ADMIN_ROLE y ADMIN_RESTAURANT_ROLE pueden crear, actualizar o eliminar mesas.

// Validaciones para crear una mesa
export const validateCreateMesa = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('numeroMesa')
        .notEmpty()
        .withMessage('El número de mesa es requerido')
        .isInt({ min: 1 })
        .withMessage('El número de mesa debe ser un número entero positivo'),
    body('capacidad')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser al menos para 1 persona'),
    body('restaurante')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    checkValidators
];

// Validaciones para actualizar una mesa
export const validateUpdateMesa = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de mesa no válido'),
    body('numeroMesa')
        .optional()
        .isInt({ min: 1 }),
    body('capacidad')
        .optional()
        .isInt({ min: 1 }),
    body('status')
        .optional()
        .isBoolean()
        .withMessage('El estado debe ser un valor booleano'),
    checkValidators
];

// Validaciones para eliminar o ver por ID
export const validateDeleteMesa = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de mesa no válido'),
    checkValidators
];

// Validator para ver/consultar una mesa por ID (mismo que eliminar)
export const validateViewMesa = validateDeleteMesa;

// Validator para listar mesas (no necesita parámetro)
export const validateListMesas = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    checkValidators
];