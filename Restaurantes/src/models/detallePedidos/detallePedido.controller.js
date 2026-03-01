import DetallePedido from './detallePedido.model.js';

export const createDetallePedido = async (req, res) => {
    try {
        const detallePedidoData = req.body;

        const detallePedido = new DetallePedido(detallePedidoData);
        await detallePedido.save();

        res.status(201).json({
            success: true,
            message: 'Detalle de pedido creado exitosamente',
            data: detallePedido
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el detalle de pedido',
            error: error.message
        })
    }
}

export const getDetallesPedidos = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const detallePedidos = await DetallePedido.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await DetallePedido.countDocuments();

        res.status(200).json({
            success: true,
            data: detallePedidos,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el detalle de pedidos',
            error: error.message
        })
    }
}

export const getDetallePedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const detallePedido = await DetallePedido.findById(id)
            .populate('pedido')
            .populate('plato');
            
        if (!detallePedido) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: detallePedido
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle de pedido',
            error: error.message
        });
    }
};

export const updateDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const detallePedidoData = req.body;
        
        const detallePedido = await DetallePedido.findById(id).populate('pedido');

        if (!detallePedido) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }

        // Validar que el usuario sea el propietario del pedido
        if (req.usuario.role === 'USER_ROLE' && (!req.usuario._id || detallePedido.pedido.usuario.toString() !== req.usuario._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este detalle de pedido'
            });
        }

        const detallePedidoActualizado = await DetallePedido.findByIdAndUpdate(
            id,
            detallePedidoData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Detalle de pedido actualizado exitosamente',
            data: detallePedidoActualizado
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el detalle de pedido',
            error: error.message
        });
    }
}

export const deleteDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        const detallePedido = await DetallePedido.findById(id).populate('pedido');

        if (!detallePedido) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado'
            });
        }

        // Validar que el usuario sea el propietario del pedido
        if (req.usuario.role === 'USER_ROLE' && (!req.usuario._id || detallePedido.pedido.usuario.toString() !== req.usuario._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este detalle de pedido'
            });
        }

        await DetallePedido.findByIdAndDelete(id);

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
}