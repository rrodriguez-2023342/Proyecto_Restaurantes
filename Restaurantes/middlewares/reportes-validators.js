import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRoles } from './validate-role.js';

//Los reportes solo los admins pueden generar los demas roles estan limitados a ver 
//los reportes que se generen, pero no pueden generar nuevos reportes, esto es para mantener la seguridad y la integridad de los datos.

// Validaciones para GENERAR reportes (Solo Admins)
export const validateGenerateReport = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    body('generadoPor')
        .not()
        .exists()
        .withMessage('No debes enviar generadoPor; se toma automaticamente del token'),
    body('tipoReporte')
        .notEmpty()
        .withMessage('El tipo de reporte es obligatorio')
        .isIn(['VENTAS', 'INVENTARIO', 'RESERVACIONES', 'PLATOS_POPULARES'])
        .withMessage('Tipo de reporte no válido'),
    body('fechaInicio')
        .notEmpty()
        .isISO8601()
        .withMessage('Fecha de inicio no válida (formato AAAA-MM-DD)'),
    body('fechaFin')
        .notEmpty()
        .isISO8601()
        .withMessage('Fecha de fin no válida (formato AAAA-MM-DD)'),
    checkValidators
];

// Validaciones para VER reportes (Solo Admins)
export const validateViewReport = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .optional()
        .isMongoId()
        .withMessage('ID de reporte no válido'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número positivo'),
    checkValidators
];

export const validateUpdateReport = [
    validateJWT,
    requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de reporte no válido'),
    body('generadoPor')
        .not()
        .exists()
        .withMessage('No puedes modificar generadoPor'),
    checkValidators
];
