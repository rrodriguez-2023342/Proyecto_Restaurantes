import { Router } from 'express';
import { createPedido, getPedidos, getPedidoById, editarPedido, eliminarPedido } from './pedido.controller.js';
import { validateCreatePedido, validateUpdatePedido, validateDeletePedido, validateViewPedido } from '../../../middlewares/pedidos-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreatePedido,
    createPedido
)

router.get(
    '/',
    validateViewPedido,
    getPedidos
)

router.get(
    '/:id',
    validateViewPedido,
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
