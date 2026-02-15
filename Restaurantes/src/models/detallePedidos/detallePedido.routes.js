import { Router } from 'express';
import { createDetallePedido, getDetallesPedidos, getDetallePedidoById } from './detallePedido.controller.js';
import { validateCreateDetallePedido } from '../../../middlewares/detallePedidos-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateDetallePedido,
    createDetallePedido
)

router.get(
    '/',
    getDetallesPedidos
)

router.get(
    '/:id',
    getDetallePedidoById
)

export default router;

