import Inventario from './inventario.model.js';

export const createInventario = async (req, res) => {
    try {
        const inventarioData = req.body;

        const inventario = new Inventario(inventarioData);
        await inventario.save();

        res.status(201).json({
            success: true,
            message: 'Inventario creado exitosamente',
            data: inventario
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el inventario',
            error: error.message
        })
    }
}

export const getInventarios = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const inventarios = await Inventario.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Inventario.countDocuments();

        res.status(200).json({
            success: true,
            data: inventarios,
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
            message: 'Error al obtener los inventarios',
            error: error.message
        })
    }
}