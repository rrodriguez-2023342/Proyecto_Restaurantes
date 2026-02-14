import { Router } from 'express';
import { createRestaurante, getRestaurantes } from './restaurante.controller.js';

const router = Router();

router.post(
    '/create',
    createRestaurante
)

router.get(
    '/',
    getRestaurantes
)

export default router;