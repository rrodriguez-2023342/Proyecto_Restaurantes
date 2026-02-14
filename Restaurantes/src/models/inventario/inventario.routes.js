import { Router } from 'express';
import { createInventario, getInventarios, getInventarioById, updateInventario, deleteInventario } from './inventario.controller.js';

const router = Router();

router.post(
    '/create',
    createInventario
)

router.get(
    '/',
    getInventarios
)

router.get(
    '/:id',
    getInventarioById
)

router.put(
    '/:id',
    updateInventario
)

router.delete(
    '/:id',
    deleteInventario
)

export default router;