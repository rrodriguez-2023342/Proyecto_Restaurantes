import Inventario from './inventario.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

const getRestaurantesFromUser = async (usuario) => {
    if (!usuario || usuario.role !== 'ADMIN_RESTAURANT_ROLE') return [];
    
    const userId = String(usuario.id || usuario._id || usuario.uid || "");
    const queryConditions = [];
    
    if (userId) {
        queryConditions.push({ dueño: userId });
    }
    if (usuario.restaurante) {
        queryConditions.push({ _id: usuario.restaurante });
    }
    
    if (queryConditions.length === 0) return [];
    
    const list = await Restaurante.find({ $or: queryConditions }).select('_id').lean();
    return list.map(r => r._id.toString());
};

export const createInventario = async (req, res) => {
    try {
        const inventarioData = { ...req.body };

        // si es admin de restaurante, forzar restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para crear inventario',
                });
            }
            if (inventarioData.restaurante) {
                const hasAccess = restauranteIds.includes(inventarioData.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para crear inventario en este restaurante',
                    });
                }
            } else {
                inventarioData.restaurante = restauranteIds[0];
            }
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
        const { page = 1, limit = 10, restaurante } = req.query;
        let query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver inventario',
                });
            }
            if (restaurante) {
                const hasAccess = restauranteIds.includes(restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver el inventario de este restaurante',
                    });
                }
                query.restaurante = restaurante;
            } else {
                query.restaurante = { $in: restauranteIds };
            }
        } else if (restaurante) {
            query.restaurante = restaurante;
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
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !inventario.restaurante || !restauranteIds.includes(inventario.restaurante._id.toString())) {
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
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !inventarioExistente.restaurante || !restauranteIds.includes(inventarioExistente.restaurante.toString())) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este inventario' });
            }

            // Evita reasignar inventario a un restaurante del cual no es dueño.
            if (inventarioData.restaurante) {
                const hasAccess = restauranteIds.includes(inventarioData.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({ success: false, message: 'No tienes permiso para mover inventario a este restaurante' });
                }
            } else {
                inventarioData.restaurante = inventarioExistente.restaurante.toString();
            }
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
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !inventario.restaurante || !restauranteIds.includes(inventario.restaurante.toString())) {
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
