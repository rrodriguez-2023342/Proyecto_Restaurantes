import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { attachRestaurant } from './attach-restaurante.js';

// USER_ROLE queda excluido no puede modificar nada como decia en la tabla solo
// ADMIN_ROLE y ADMIN_RESTAURANT_ROLE pueden crear, actualizar o eliminar mesas.

// Validaciones para crear una mesa. El numero de mesa se asigna automaticamente.
export const validateCreateMesa = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('capacidad')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1, max: 12 })
        .withMessage('La capacidad debe ser entre 1 y 12 personas'),
    body('restaurante')
        .if((value, { req }) => req.usuario?.role === 'ADMIN_ROLE')
        .notEmpty()
        .withMessage('El ID del restaurante es requerido')
        .isMongoId()
        .withMessage('ID de restaurante no valido'),
    checkValidators
];

// Validaciones para actualizar una mesa
export const validateUpdateMesa = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de mesa no valido'),
    body('capacidad')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('La capacidad debe ser entre 1 y 12 personas'),
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
        .withMessage('ID de mesa no valido'),
    checkValidators
];

// Validator para ver/consultar una mesa por ID (mismo que eliminar)
export const validateViewMesa = validateDeleteMesa;

// Validator para listar mesas (no necesita parametro)
export const validateListMesas = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    checkValidators
];
