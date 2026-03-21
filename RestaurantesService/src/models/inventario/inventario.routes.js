import { Router } from 'express';
import { createInventario, getInventarios, getInventarioById, updateInventario, deleteInventario } from './inventario.controller.js';
import { validateCreateInventario, validateUpdateInventario, validateDeleteInventario, validateListInventarios } from '../../../middlewares/inventario-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateInventario,
    createInventario
)

router.get(
    '/',
    validateListInventarios,
    getInventarios
)

router.get(
    '/:id',
    validateDeleteInventario, // same structure as delete
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