import { Router } from 'express';
import { createInventario, getInventarios, getInventarioById, updateInventario, deleteInventario } from './inventario.controller.js';
import { validateCreateInventario, validateUpdateInventario, validateDeleteInventario } from '../../../middlewares/inventario-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateInventario,
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
    validateUpdateInventario,
    updateInventario
)

router.delete(
    '/:id',
    validateDeleteInventario,
    deleteInventario
)

export default router;