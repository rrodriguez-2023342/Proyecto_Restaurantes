import Pedido from './pedido.model.js';

export const createPedido = async (req, res) => {
    try {
        const pedidoData = req.body;

        const pedido = new Pedido(pedidoData);
        await pedido.save();

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: pedido
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el pedido',
            error: error.message
        })
    }
}

export const getPedidos = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const pedidos = await Pedido.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Pedido.countDocuments();

        res.status(200).json({
            success: true,
            data: pedidos,
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
            message: 'Error al obtener los pedidos',
            error: error.message
        })
    }
}

export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.findById(id).populate('restaurante');

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Pedido obtenido exitosamente',
            data: pedido
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido',
            error: error.message
        });
    }
}

export const editarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoData = req.body;

        const pedidoEditado = await Pedido.findByIdAndUpdate(
            id,
            pedidoData,
            { new: true, runValidators: true }
        )

        if (!pedidoEditado) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pedido editado exitosamente',
            data: pedidoEditado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el pedido',
            error: error.message
        });
    }
}

export const eliminarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const pedidoEliminado = await Pedido.findByIdAndDelete(id);

        if (!pedidoEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pedido eliminado correctamente',
            data: pedidoEliminado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el pedido',
            error: error.message
        });
    }
};