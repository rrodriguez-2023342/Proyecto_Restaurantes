import { Router } from 'express';
import { createFactura, getFacturas, getFacturaById, updateFactura, deleteFactura } from './factura.controller.js';

const router = Router();

router.post(
    '/create',
    createFactura
)

router.get(
    '/',
    getFacturas
)

router.get(
    '/:id',
    getFacturaById
)

router.put(
    '/:id',
    updateFactura
)

router.delete(
    '/:id',
    deleteFactura
)

export default router;