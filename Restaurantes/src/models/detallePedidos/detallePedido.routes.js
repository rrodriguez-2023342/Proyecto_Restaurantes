import { Router } from 'express';
import { createDetallePedido, getDetallesPedidos } from './detallePedido.controller.js';

const router = Router();

router.post(
    '/create',
    createDetallePedido
)

router.get(
    '/',
    getDetallesPedidos
)

export default router;