import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { validateRestaurantOwnerUser } from '../src/helpers/auth-user.helper.js';

const OWNER_FIELD = 'due\u00F1o';

const getRequestToken = (req) =>
    req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

const normalizeOwnerField = (req, _, next) => {
    const rawOwner = req.body[OWNER_FIELD] ?? req.body.dueno;
    if (Array.isArray(rawOwner)) {
        req.body[OWNER_FIELD] = String(rawOwner[0]).trim();
    } else if (rawOwner !== undefined && rawOwner !== null) {
        req.body[OWNER_FIELD] = String(rawOwner).trim();
    }
    delete req.body.dueno;
    next();
};

const validateOwnerRoleInAuthService = async (ownerId, req) => {
    const token = getRequestToken(req);
    const result = await validateRestaurantOwnerUser({ ownerId, token });
    if (!result.isValid) {
        throw new Error(result.message);
    }
    return true;
};

// Validaciones para CREAR restaurante (Solo ADMIN_ROLE)
export const validateCreateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    normalizeOwnerField,
    // Normalizacion de campos para soportar form-data y asignar dueno automaticamente
    (req, res, next) => {
        ['nombre', 'direccion', 'telefono', 'descripcion', 'categoria', OWNER_FIELD].forEach((field) => {
            if (Array.isArray(req.body[field])) {
                req.body[field] = req.body[field][0];
            }
        });

        if (req.body[OWNER_FIELD]) {
            req.body[OWNER_FIELD] = String(req.body[OWNER_FIELD]).trim();
        } else if (req.usuario && req.usuario.id) {
            req.body[OWNER_FIELD] = String(req.usuario.id).trim();
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
        .withMessage('La descripcion del restaurante es obligatoria')
        .isLength({ max: 500 })
        .withMessage('La descripcion no puede exceder los 500 caracteres'),
    body('direccion')
        .notEmpty()
        .withMessage('La direccion es obligatoria'),
    body('categoria')
        .notEmpty()
        .withMessage('La categoria es obligatoria'),
    body('telefono')
        .notEmpty()
        .withMessage('El telefono es obligatorio'),
    body(OWNER_FIELD)
        .notEmpty()
        .withMessage('El dueno es obligatorio')
        .bail()
        .custom((value, { req }) => validateOwnerRoleInAuthService(value, req)),
    checkValidators,
];

// Validaciones para VER restaurantes
export const validateViewRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id').optional().isMongoId().withMessage('ID de restaurante no valido'),
    checkValidators,
];

// Validaciones para ACTUALIZAR restaurante
export const validateUpdateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    normalizeOwnerField,
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no valido'),
    body('nombre').optional().notEmpty(),
    body('direccion').optional().notEmpty(),
    body('telefono').optional().notEmpty(),
    body(OWNER_FIELD)
        .optional()
        .custom((value, { req }) => {
            if (req.user?.role !== 'ADMIN_ROLE') {
                throw new Error('Solo ADMIN_ROLE puede reasignar el dueno');
            }
            return validateOwnerRoleInAuthService(value, req);
        }),
    checkValidators,
];

// Validaciones para ELIMINAR restaurante (Solo ADMIN_ROLE)
export const validateDeleteRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no valido'),
    checkValidators,
];
