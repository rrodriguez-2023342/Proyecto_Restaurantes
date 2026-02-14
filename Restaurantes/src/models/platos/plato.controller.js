import Plato from './plato.model.js';

export const createPlato = async (req, res) => {
    try {
        const platoData = req.body;

        const plato = new Plato(platoData);
        await plato.save();

        res.status(201).json({
            success: true,
            message: 'Plato creado exitosamente',
            data: plato
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el plato',
            error: error.message
        })
    }
}

export const getPlatos = async (req, res) => {
    try {
        const { page = 1, limit = 10, disponible = true} = req.query;

        const filter = { disponible };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const platos = await Plato.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Plato.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: platos,
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
            message: 'Error al obtener los platos',
            error: error.message
        })
    }
}

export const getPlatoById = async (req, res) => {
    try {
        const { id } = req.params;

        const plato = await Plato.findById(id)
            .populate('menu');

        if (!plato) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: plato
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el plato',
            error: error.message
        });
    }
};

export const editarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const platoData = req.body;

        const platoUpdated = await Plato.findByIdAndUpdate(
            id,
            platoData,
            { new: true, runValidators: true }
        );

        if (!platoUpdated) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Plato actualizado correctamente',
            data: platoUpdated
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el plato',
            error: error.message
        });
    }
};

export const eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;

        const platoEliminado = await Plato.findByIdAndUpdate(
            id,
            { disponible: false },
            { new: true }
        );

        if (!platoEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Plato eliminado correctamente',
            data: platoEliminado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el plato',
            error: error.message
        });
    }
};