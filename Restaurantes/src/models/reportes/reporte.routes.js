import { Router } from 'express';
import { 
    createReporte, 
    getReportes, 
    getReporteById, 
    updateReporte 
} from './reporte.controller.js';
import { 
    validateGenerateReport, 
    validateViewReport 
} from '../../../middlewares/reportes-validators.js';

const router = Router();

// Generar un nuevo reporte
router.post(
    '/create',
    validateGenerateReport,
    createReporte
);

// Obtener todos los reportes
router.get(
    '/',
    validateViewReport,
    getReportes
);

// Obtener un reporte específico por ID
router.get(
    '/:id',
    validateViewReport,
    getReporteById
);

// Actualizar un reporte
router.put(
    '/:id',
    validateViewReport,
    updateReporte
);

export default router;