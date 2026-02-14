import { Router } from 'express';
import { createReservacion, getReservaciones, updateReservacion, deleteReservacion, getReservacionById } from './reservacion.controller.js';

const router = Router();

router.post(
    '/create',
    createReservacion
)

router.get(
    '/',
    getReservaciones
)

router.put(
    '/:id',
    updateReservacion
)

router.delete(
    '/:id',
    deleteReservacion
)
router.get(
    '/:id',
    getReservacionById
)

export default router;