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