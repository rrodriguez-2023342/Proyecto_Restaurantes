import { Router } from 'express';
import { createFactura, getFacturas } from './factura.controller.js';

const router = Router();

router.post(
    '/create',
    createFactura
)

router.get(
    '/',
    getFacturas
)

export default router;