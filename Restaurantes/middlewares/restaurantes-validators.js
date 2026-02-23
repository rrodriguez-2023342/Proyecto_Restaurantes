import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

// Validaciones para CREAR restaurante (Solo ADMIN_ROLE)
export const validateCreateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    // Normalización de campos para soportar form-data y asignar dueño automáticamente
    (req, res, next) => {
        ['nombre', 'direccion', 'telefono', 'descripcion', 'categoria', 'dueño'].forEach(field => {
            if (Array.isArray(req.body[field])) {
                req.body[field] = req.body[field][0];
            }
        });
        // Forzar dueño a string simple
        if (req.body['dueño']) {
            req.body['dueño'] = String(req.body['dueño']);
        } else if (req.usuario && req.usuario.id) {
            req.body['dueño'] = String(req.usuario.id);
        }
        next();
    },
    body('nombre')
        .notEmpty()
        .withMessage('El nombre del restaurante es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder los 100 caracteres'),
    body('descripcion')
        .notEmpty()
        .withMessage('La descripción del restaurante es obligatoria')
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder los 500 caracteres'),
    body('direccion')
        .notEmpty()
        .withMessage('La dirección es obligatoria'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria'),
    body('telefono')
        .notEmpty()
        .withMessage('El teléfono es obligatorio'),
    body('dueño')
        .notEmpty()
        .withMessage('El dueño es obligatorio'),
    checkValidators
];

// Validaciones para VER restaurantes
export const validateViewRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id').optional().isMongoId().withMessage('ID de restaurante no válido'),
    checkValidators
];

// Validaciones para ACTUALIZAR restaurante
export const validateUpdateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    body('nombre').optional().notEmpty(),
    body('direccion').optional().notEmpty(),
    body('telefono').optional().notEmpty(),
    checkValidators
];

// Validaciones para ELIMINAR restaurante (Solo ADMIN_ROLE)
export const validateDeleteRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    checkValidators
];