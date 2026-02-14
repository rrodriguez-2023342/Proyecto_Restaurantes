import { Router } from 'express';
import { createInventario, getInventarios } from './inventario.controller.js';

const router = Router();

router.post(
    '/create',
    createInventario
)

router.get(
    '/',
    getInventarios
)

export default router;