import { Router } from 'express';
import { createDetallePedido, getDetallesPedidos, getDetallePedidoById, updateDetallePedido, deleteDetallePedido } from './detallePedido.controller.js';

const router = Router();

router.post(
    '/create',
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

router.put(
    '/:id',
    updateDetallePedido
)

router.delete(
    '/:id',
    deleteDetallePedido
)

export default router;