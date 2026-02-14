import { Router } from 'express';
import { createEvento, getEventos, getEventoById, updateEvento, deleteEvento } from './evento.controller.js';

const router = Router();

router.post(
    '/create',
    createEvento
)

router.get(
    '/',
    getEventos
)

router.get(
    '/:id',
    getEventoById
)

router.put(
    '/:id',
    updateEvento
)

router.delete(
    '/:id',
    deleteEvento
)
export default router;