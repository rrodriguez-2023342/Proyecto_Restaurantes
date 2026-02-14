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


export const getRestaurantesById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const restaurante = await Restaurante.findById(id);


        if (!restaurante) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Restaurante obtenido exitosamente',
            data: restaurante
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el restaurante',
            error: error.message
        });
    }
}

export const updateRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const restauranteData = req.body;

        const restauranteEditado = await Restaurante.findByIdAndUpdate(
            id,
            restauranteData,
            { new: true, runValidators: true }
        )

        if (!restauranteEditado) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restaurante editado exitosamente',
            data: restauranteEditado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el restaurante',
            error: error.message
        });
    }
}

export const deleteRestaurante = async (req, res) => {
    try {
        const { id } = req.params;

        const restauranteEliminado = await Restaurante.findByIdAndDelete(id);

        if (!restauranteEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Restaurante eliminado correctamente',
            data: restauranteEliminado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el restaurante',
            error: error.message
        });
    }
};