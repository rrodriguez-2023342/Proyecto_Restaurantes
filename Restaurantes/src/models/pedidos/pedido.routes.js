import { Router } from 'express';
import { createPedido, getPedidos } from './pedido.controller.js';

const router = Router();

router.post(
    '/create',
    createPedido
)

router.get(
    '/',
    getPedidos
)

export default router;