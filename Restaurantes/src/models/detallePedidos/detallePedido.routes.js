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
    validateDeleteDetallePedido,
    validateViewDetallePedidoById,
    validateViewDetallePedidoByPedido
} from '../../../middlewares/detallePedidos-validators.js';

const router = Router();

router.post('/create', validateCreateDetallePedido, createDetallePedido);
router.get('/', getDetallesPedidos);
router.get('/pedido/:pedidoId', validateViewDetallePedidoByPedido, getDetallePedidoByPedido);  // para la factura
router.get('/:id', validateViewDetallePedidoById, getDetallePedidoById);
router.put('/:id', validateUpdateDetallePedido, updateDetallePedido);
router.delete('/:id', validateDeleteDetallePedido, deleteDetallePedido);

export default router;
