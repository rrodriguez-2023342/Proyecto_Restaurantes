import { Router } from 'express';
import { createReporte, getReportes } from './reporte.controller.js';

const router = Router();

router.post(
    '/create',
    createReporte
)

router.get(
    '/',
    getReportes
)

export default router;