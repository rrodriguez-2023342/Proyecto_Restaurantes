import { Router } from 'express';
import { createFactura, getFacturas, getFacturaById, updateFactura, deleteFactura } from './factura.controller.js';
import { validateCreateFactura, validateUpdateFactura, validateDeleteFactura } from '../../../middlewares/facturas-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateFactura,
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
    validateUpdateFactura,
    updateFactura
)

router.delete(
    '/:id',
    validateDeleteFactura,
    deleteFactura
)

export default router;