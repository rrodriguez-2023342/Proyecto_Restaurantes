import Inventario from './inventario.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

export const createInventario = async (req, res) => {
    try {
        const inventarioData = req.body;

        // si es admin de restaurante, forzar restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            inventarioData.restaurante = req.usuario.restaurante;
        }

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
        let query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver inventario',
                });
            }
            query.restaurante = adminRestaurantId;
        }

        const [inventarios, total] = await Promise.all([
            Inventario.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Inventario.countDocuments(query)
        ]);

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

export const getInventarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const inventario = await Inventario.findById(id)
            .populate('restaurante');
            
        if (!inventario) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!inventario.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado a este inventario'
                });
            }
            if (inventario.restaurante._id.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado a este inventario'
                });
            }
        }
        
        res.status(200).json({
            success: true,
            data: inventario
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el inventario',
            error: error.message
        });
    }
};

export const updateInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const inventarioData = req.body;
        let adminRestaurantId = null;
        
        const inventarioExistente = await Inventario.findById(id);
        if (!inventarioExistente) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!inventarioExistente.restaurante || !adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este inventario' });
            }
            if (String(inventarioExistente.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este inventario' });
            }

            // Evita reasignar inventario a otro restaurante.
            if (inventarioData.restaurante && String(inventarioData.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No puedes mover inventario a otro restaurante' });
            }
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            inventarioData.restaurante = adminRestaurantId;
        }

        const inventario = await Inventario.findByIdAndUpdate(
            id,
            inventarioData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Inventario actualizado exitosamente',
            data: inventario
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el inventario',
            error: error.message
        });
    }
}

export const deleteInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const inventario = await Inventario.findById(id);

        if (!inventario) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!inventario.restaurante || !adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este inventario' });
            }
            if (String(inventario.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este inventario' });
            }
        }

        await Inventario.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Inventario eliminado exitosamente'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el inventario',
            error: error.message
        });
    }
}
