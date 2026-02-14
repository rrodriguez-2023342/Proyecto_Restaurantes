import { Router } from 'express';
import { createEvento, getEventos } from './evento.controller.js';

const router = Router();

router.post(
    '/create',
    createEvento
)

router.get(
    '/',
    getEventos
)

export default router;