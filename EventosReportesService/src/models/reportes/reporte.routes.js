import { Router } from 'express';
import { createReporte, getReportes, getReporteById, updateReporte, deleteReporte, generarReporte, getDashboardStats, exportReportCSV, exportReportPDF } from './reporte.controller.js';
import { 
    validateGenerateReport, 
    validateViewReport,
    validateUpdateReport
} from '../../../middlewares/reportes-validators.js';

const router = Router();

// Generar un nuevo reporte
router.post(
    '/create',
    validateGenerateReport,
    createReporte
);

// Dashboard de métricas para reportes
router.get(
    '/dashboard',
    validateViewReport,
    getDashboardStats
);

// Exportar reporte de métricas
router.get(
    '/export/csv',
    validateViewReport,
    exportReportCSV
);

router.get(
    '/export/pdf',
    validateViewReport,
    exportReportPDF
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
    validateUpdateReport,
    updateReporte
);

router.delete(
    '/:id',
    deleteReporte
)

router.get('/:id/pdf', validateViewReport, generarReporte);

export default router;
