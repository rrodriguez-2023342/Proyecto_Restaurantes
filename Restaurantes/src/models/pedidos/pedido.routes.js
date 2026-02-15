import { Router } from 'express';
import { createPedido, getPedidos, getPedidoById, editarPedido, eliminarPedido } from './pedido.controller.js';
import { validateCreatePedido, validateUpdatePedido, validateDeletePedido } from '../../../middlewares/pedidos-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreatePedido,
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
    validateUpdatePedido,
    editarPedido
)

router.delete(
    '/:id',
    validateDeletePedido,
    eliminarPedido
)

export default router;