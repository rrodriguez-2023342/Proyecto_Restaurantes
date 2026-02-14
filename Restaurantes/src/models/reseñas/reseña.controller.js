import Reseña from './reseña.model.js';

export const createReseña = async (req, res) => {
    try {
        const reseñaData = req.body;

        const reseña = new Reseña(reseñaData);
        await reseña.save();

        res.status(201).json({
            success: true,
            message: 'Reseña creada exitosamente',
            data: reseña
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reseña',
            error: error.message
        })
    }
}

export const getReseñas = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const reseñas = await Reseña.find({})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Reseña.countDocuments();

        res.status(200).json({
            success: true,
            data: reseñas,
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
            message: 'Error al obtener las reseñas',
            error: error.message
        })
    }
}