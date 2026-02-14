import Reservacion from './reservacion.model.js';

export const createReservacion = async (req, res) => {
    try {
        const reservacionData = req.body;

        const reservacion = new Reservacion(reservacionData);
        await reservacion.save();

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservacion
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        })
    }
}

export const getReservaciones = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true} = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const reservaciones = await Reservacion.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Reservacion.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reservaciones,
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
            message: 'Error al obtener las reservaciones',
            error: error.message
        })
    }
}