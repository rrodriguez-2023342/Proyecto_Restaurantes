import Mesa from './mesa.model.js';

export const createMesa = async (req, res) => {
    try {
        const mesaData = req.body;

        const mesa = new Mesa(mesaData);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: mesa
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        })
    }
}

export const getMesas = async (req, res) => {
    try {
        const { page = 1, limit = 10, disponibilidad = true} = req.query;

        const filter = { disponibilidad };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const mesas = await Mesa.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Mesa.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: mesas,
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
            message: 'Error al obtener las mesas',
            error: error.message
        })
    }
}