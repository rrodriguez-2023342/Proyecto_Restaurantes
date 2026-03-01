import { Router } from 'express';
import {
    createDetallePedido,
    getDetallesPedidos,
    getDetallePedidoById,
    getDetallePedidoByPedido,
    updateDetallePedido,
    deleteDetallePedido
} from './detallePedido.controller.js';
import {
    validateCreateDetallePedido,
    validateUpdateDetallePedido,
    validateDeleteDetallePedido
} from '../../../middlewares/detallePedidos-validators.js';

const router = Router();

router.post('/create', validateCreateDetallePedido, createDetallePedido);
router.get('/', getDetallesPedidos);
router.get('/pedido/:pedidoId', getDetallePedidoByPedido);  // para la factura
router.get('/:id', getDetallePedidoById);
router.put('/:id', validateUpdateDetallePedido, updateDetallePedido);
router.delete('/:id', validateDeleteDetallePedido, deleteDetallePedido);

export default router;