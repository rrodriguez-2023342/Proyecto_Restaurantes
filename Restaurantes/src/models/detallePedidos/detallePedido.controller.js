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