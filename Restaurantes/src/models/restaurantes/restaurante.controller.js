import Restaurante from './restaurante.model.js';

export const createRestaurante = async (req, res) => {
    try {
        const restauranteData = req.body;

        const restaurante = new Restaurante(restauranteData);
        await restaurante.save();

        res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente',
            data: restaurante
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante',
            error: error.message
        })
    }
}

export const getRestaurantes = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true} = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const restaurantes = await Restaurante.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Restaurante.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: restaurantes,
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
            message: 'Error al obtener los restaurantes',
            error: error.message
        })
    }
}