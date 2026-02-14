import { Router } from 'express';
import { createReservacion, getReservaciones } from './reservacion.controller.js';

const router = Router();

router.post(
    '/create',
    createReservacion
)

router.get(
    '/',
    getReservaciones
)

export default router;