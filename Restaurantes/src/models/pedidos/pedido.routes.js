import { Router } from 'express';
import { createPedido, getPedidos, getPedidoById, editarPedido, eliminarPedido } from './pedido.controller.js';

const router = Router();

router.post(
    '/create',
    createPedido
)

router.get(
    '/',
    getPedidos
)

router.get(
    '/:id',
    getPedidoById
)

router.put(
    '/:id',
    editarPedido
)

router.delete(
    '/:id',
    eliminarPedido
)

export default router;