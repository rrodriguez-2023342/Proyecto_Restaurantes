import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { attachRestaurant } from './attach-restaurante.js';

export const validateCreateMenu = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('restaurante')
        .custom((value, { req }) => {
            if (req.user?.role === 'ADMIN_RESTAURANT_ROLE') return true;
            if (!value) throw new Error('El ID del restaurante es requerido');
            return true;
        })
        .bail()
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser valido'),
    body('nombreMenu')
        .trim()
        .notEmpty()
        .withMessage('El nombre del menu es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionMenu')
        .trim()
        .notEmpty()
        .withMessage('La descripcion del menu es requerida')
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripcion debe tener entre 10 y 500 caracteres'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    checkValidators,
];

export const validateUpdateMenu = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del menu es requerido')
        .isMongoId()
        .withMessage('El ID del menu debe ser valido'),
    body('restaurante')
        .optional()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser valido'),
    body('nombreMenu')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcionMenu')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('La descripcion debe tener entre 10 y 500 caracteres'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    checkValidators,
];

export const validateDeleteMenu = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El ID del menu es requerido')
        .isMongoId()
        .withMessage('El ID del menu debe ser valido'),
    checkValidators,
];

export const validateViewMenu = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .optional()
        .isMongoId()
        .withMessage('El ID del menu debe ser valido'),
    checkValidators,
];
