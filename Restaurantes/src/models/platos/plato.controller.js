import Plato from './plato.model.js';


//CREAR PLATO
//Solo accesible por ADMIN_ROLE y ADMIN_RESTAURANT_ROLE.

export const createPlato = async (req, res) => {
    try {
        const platoData = req.body;
        const plato = new Plato(platoData);
        await plato.save();

        res.status(201).json({
            success: true,
            message: 'Plato creado exitosamente',
            data: plato
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el plato',
            error: error.message
        });
    }
};


//OBTENER PLATOS
//Regla: Solo se muestran platos con "disponible".

export const getPlatos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const filter = { disponible: true };

        const [platos, total] = await Promise.all([
            Plato.find(filter)
                .populate('menu', 'nombreMenu')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Plato.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: platos,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los platos',
            error: error.message
        });
    }
};

//Obtener plato por ID
export const getPlatoById = async (req, res) => {
    try {
        const { id } = req.params;
        const plato = await Plato.findById(id).populate('menu');

        if (!plato || !plato.disponible) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado o no disponible'
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

//Editar plato

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


//ELIMINAR PLATO
//Regla: Cambia el estado "disponible" a false.

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
            message: 'Plato desactivado (eliminado) correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el plato',
            error: error.message
        });
    }
};