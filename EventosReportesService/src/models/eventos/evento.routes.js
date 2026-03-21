import { Router } from 'express';
import { createEvento, getEventos, getEventoById, updateEvento, deleteEvento } from './evento.controller.js';
import { validateCreateEvento, validateUpdateEvento, validateDeleteEvento, validateViewEvento } from '../../../middlewares/eventos-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateEvento,
    createEvento
)

router.get(
    '/',
    validateViewEvento,
    getEventos
)

router.get(
    '/:id',
    validateViewEvento,
    getEventoById
)

router.put(
    '/:id',
    validateUpdateEvento,
    updateEvento
)

router.delete(
    '/:id',
    validateDeleteEvento,
    deleteEvento
)

export default router;
