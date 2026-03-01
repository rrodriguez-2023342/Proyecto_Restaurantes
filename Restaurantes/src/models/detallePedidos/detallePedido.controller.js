import DetallePedido from './detallePedido.model.js';
import Pedido from '../pedidos/pedido.model.js';
import Plato from '../platos/plato.model.js';

// Recalcula el totalPedido 
const recalcularTotalPedido = async (pedidoId) => {
    const detalle = await DetallePedido.findOne({ pedido: pedidoId });
    if (!detalle) {
        await Pedido.findByIdAndUpdate(pedidoId, { totalPedido: 0 });
        return;
    }
    const total = detalle.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    await Pedido.findByIdAndUpdate(pedidoId, {
        totalPedido: parseFloat(total.toFixed(2))
    });
};

export const createDetallePedido = async (req, res) => {
    try {
        const { pedido, items } = req.body;

        // verificar que el pedido existe
        const pedidoExistente = await Pedido.findById(pedido);
        if (!pedidoExistente) {
            return res.status(404).json({
                success: false,
                message: 'El pedido indicado no existe'
            });
        }

        // verificar que no exista ya un detalle para este pedido
        const detalleExistente = await DetallePedido.findOne({ pedido });
        if (detalleExistente) {
            return res.status(400).json({
                success: false,
                message: 'Este pedido ya tiene un detalle, usa PUT para modificarlo'
            });
        }

        // construir los items jalando el precio de cada plato desde la BD
        const itemsConPrecio = [];
        for (const item of items) {
            const platoObj = await Plato.findById(item.plato).lean();
            if (!platoObj) {
                return res.status(404).json({
                    success: false,
                    message: `Plato con id ${item.plato} no encontrado`
                });
            }
            itemsConPrecio.push({
                plato: item.plato,
                cantidad: item.cantidad,
                precio: platoObj.precio
            });
        }

        const detalle = new DetallePedido({ pedido, items: itemsConPrecio });
        await detalle.save();

        // actualizar el total del pedido
        await recalcularTotalPedido(pedido);
        const pedidoActualizado = await Pedido.findById(pedido);

        const { _id, ...detalleData } = detalle.toObject();

        res.status(201).json({
            success: true,
            message: 'Detalle de pedido creado exitosamente',
            detallePedidoId: _id,
            pedidoId: pedido,
            totalPedido: pedidoActualizado.totalPedido,
            data: detalleData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el detalle del pedido',
            error: error.message
        });
    }
};

export const getDetallesPedidos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const [detalles, total] = await Promise.all([
            DetallePedido.find()
                .populate('pedido', 'tipoPedido estadoPedido totalPedido')
                .populate('items.plato', 'nombre precio')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            DetallePedido.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: detalles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de pedidos',
            error: error.message
        });
    }
};

// GET por _id del detalle
export const getDetallePedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const detalle = await DetallePedido.findById(id)
            .populate('pedido', 'tipoPedido estadoPedido totalPedido restaurante usuario')
            .populate('items.plato', 'nombre precio');

        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: detalle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle de pedido',
            error: error.message
        });
    }
};

// GET por pedidoId para generar la factura
export const getDetallePedidoByPedido = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const detalle = await DetallePedido.findOne({ pedido: pedidoId })
            .populate('pedido', 'tipoPedido estadoPedido totalPedido restaurante usuario')
            .populate('items.plato', 'nombre precio');

        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró detalle para este pedido'
            });
        }

        res.status(200).json({
            success: true,
            data: detalle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle del pedido',
            error: error.message
        });
    }
};

export const updateDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        const detalle = await DetallePedido.findById(id).populate('pedido');
        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }

        if (
            req.usuario.role === 'USER_ROLE' &&
            detalle.pedido.usuario.toString() !== req.usuario._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este detalle de pedido'
            });
        }

        // reconstruir items jalando precios actualizados de la BD
        const itemsConPrecio = [];
        for (const item of items) {
            const platoObj = await Plato.findById(item.plato).lean();
            if (!platoObj) {
                return res.status(404).json({
                    success: false,
                    message: `Plato con id ${item.plato} no encontrado`
                });
            }
            itemsConPrecio.push({
                plato: item.plato,
                cantidad: item.cantidad,
                precio: platoObj.precio
            });
        }

        const detalleActualizado = await DetallePedido.findByIdAndUpdate(
            id,
            { items: itemsConPrecio },
            { new: true, runValidators: true }
        ).populate('items.plato', 'nombre precio');

        await recalcularTotalPedido(detalle.pedido._id);
        const pedidoActualizado = await Pedido.findById(detalle.pedido._id);

        res.status(200).json({
            success: true,
            message: 'Detalle de pedido actualizado exitosamente',
            totalPedido: pedidoActualizado.totalPedido,
            data: detalleActualizado
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el detalle de pedido',
            error: error.message
        });
    }
};

export const deleteDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;

        const detalle = await DetallePedido.findById(id).populate('pedido');
        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }

        if (
            req.usuario.role === 'USER_ROLE' &&
            detalle.pedido.usuario.toString() !== req.usuario._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este detalle de pedido'
            });
        }

        const pedidoId = detalle.pedido._id;
        await DetallePedido.findByIdAndDelete(id);
        await recalcularTotalPedido(pedidoId);

        res.status(200).json({
            success: true,
            message: 'Detalle de pedido eliminado exitosamente'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el detalle de pedido',
            error: error.message
        });
    }
};