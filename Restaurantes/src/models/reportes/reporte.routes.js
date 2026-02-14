import { Router } from 'express';
import { createReporte, getReportes, getReporteById, updateReporte, deleteReporte } from './reporte.controller.js';

const router = Router();

router.post(
    '/create',
    createReporte
)

router.get(
    '/',
    getReportes
)

router.put(
    '/:id',
    updateReporte
)

router.delete(
    '/:id',
    deleteReporte
)
router.get(
    '/:id',
    getReporteById
)

export default router;