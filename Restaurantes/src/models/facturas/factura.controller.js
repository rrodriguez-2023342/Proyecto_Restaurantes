import Factura from './factura.model.js';

export const createFactura = async (req, res) => {
    try {
        const facturaData = req.body;

        const factura = new Factura(facturaData);
        await factura.save();

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            data: factura
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la factura',
            error: error.message
        })
    }
}

export const getFacturas = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const facturas = await Factura.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Factura.countDocuments();


        res.status(200).json({
            success: true,
            data: facturas,
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
            message: 'Error al obtener las facturas',
            error: error.message
        })
    }
}