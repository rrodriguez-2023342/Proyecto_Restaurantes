import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';
import { validateRestaurantOwnerUser } from '../src/helpers/auth-user.helper.js';
import { attachRestaurant } from './attach-restaurante.js';

const OWNER_FIELD = 'due\u00F1o';

const getRequestToken = (req) =>
    req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

const normalizeOwnerField = (req, _, next) => {
    if (!req.body || typeof req.body !== 'object') req.body = {};
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
    if (!result.isValid) throw new Error(result.message);
    return true;
};

const diasValidos = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const categoriasValidas = [
    'Italiana', 'Mexicana', 'Guatemalteca', 'Americana', 'China',
    'Japonesa', 'Francesa', 'Mariscos', 'Vegetariana', 'Cafetería',
    'Panadería', 'Fusión', 'Otro'
];

export const validateCreateRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    normalizeOwnerField,
    (req, res, next) => {
        ['nombre', 'telefono', 'descripcion', 'categoria', OWNER_FIELD].forEach((field) => {
            if (Array.isArray(req.body[field])) req.body[field] = req.body[field][0];
        });
        if (req.body[OWNER_FIELD]) {
            req.body[OWNER_FIELD] = String(req.body[OWNER_FIELD]).trim();
        } else if (req.usuario?.id) {
            req.body[OWNER_FIELD] = String(req.usuario.id).trim();
        }
        next();
    },
    // Básicos
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
    body('categoria')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isIn(categoriasValidas).withMessage('Categoría no válida'),
    // Contacto
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio'),
    body('correo')
        .optional()
        .isEmail().withMessage('El correo no es válido'),
    // Dirección
    body('direccion.calle')
        .notEmpty().withMessage('La calle es obligatoria'),
    body('direccion.ciudad')
        .notEmpty().withMessage('La ciudad es obligatoria'),
    body('direccion.zona').optional(),
    body('direccion.departamento').optional(),
    body('direccion.pais').optional(),
    body('direccion.referencia')
        .optional()
        .isLength({ max: 300 }).withMessage('La referencia no puede exceder 300 caracteres'),
    // Horario
    body('horario.apertura')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de apertura inválida, use HH:MM'),
    body('horario.cierre')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de cierre inválida, use HH:MM'),
    body('horario.diasAbierto')
        .optional()
        .isArray().withMessage('diasAbierto debe ser un array')
        .custom((dias) => dias.every(d => diasValidos.includes(d)))
        .withMessage(`Los días deben ser: ${diasValidos.join(', ')}`),
    // Dueño
    body(OWNER_FIELD)
        .notEmpty().withMessage('El dueño es obligatorio')
        .bail()
        .custom((value, { req }) => validateOwnerRoleInAuthService(value, req)),
    checkValidators,
];

export const validateViewRestaurante = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'),
    param('id').optional().isMongoId().withMessage('ID de restaurante no válido'),
    checkValidators,
];

export const validateUpdateRestaurante = [
    validateJWT,
    attachRestaurant,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    normalizeOwnerField,
    param('id').isMongoId().withMessage('ID de restaurante no válido'),
    body('nombre').optional().notEmpty().isLength({ max: 100 }),
    body('descripcion').optional().isLength({ max: 500 }),
    body('categoria').optional().isIn(categoriasValidas).withMessage('Categoría no válida'),
    body('telefono').optional().notEmpty(),
    body('correo').optional().isEmail().withMessage('El correo no es válido'),
    body('direccion.calle').optional().notEmpty(),
    body('direccion.ciudad').optional().notEmpty(),
    body('direccion.zona').optional(),
    body('direccion.departamento').optional(),
    body('direccion.referencia').optional().isLength({ max: 300 }),
    body('horario.apertura')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de apertura inválida, use HH:MM'),
    body('horario.cierre')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora de cierre inválida, use HH:MM'),
    body('horario.diasAbierto')
        .optional()
        .isArray().withMessage('diasAbierto debe ser un array')
        .custom((dias) => dias.every(d => diasValidos.includes(d)))
        .withMessage(`Los días deben ser: ${diasValidos.join(', ')}`),
    body(OWNER_FIELD)
        .optional()
        .custom((value, { req }) => {
            if (req.usuario?.role !== 'ADMIN_ROLE') {
                throw new Error('Solo ADMIN_ROLE puede reasignar el dueño');
            }
            return validateOwnerRoleInAuthService(value, req);
        }),
    checkValidators,
];

export const validateDeleteRestaurante = [
    validateJWT,
    requireRoles('ADMIN_ROLE'),
    param('id').isMongoId().withMessage('ID de restaurante no válido'),
    checkValidators,
];