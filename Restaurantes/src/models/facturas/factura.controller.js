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

export const getFacturaById = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findById(id)
            .populate('pedido');
            
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }
        
        res.status(200).json({
            success: true,
            data: factura
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la factura',
            error: error.message
        });
    }
};

export const updateFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const facturaData = req.body;
        
        const factura = await Factura.findByIdAndUpdate(
            id,
            facturaData,
            { new: true, runValidators: true }
        );

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Factura actualizada exitosamente',
            data: factura
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la factura',
            error: error.message
        });
    }
}

export const deleteFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findByIdAndDelete(id);

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Factura eliminada exitosamente'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la factura',
            error: error.message
        });
    }
}