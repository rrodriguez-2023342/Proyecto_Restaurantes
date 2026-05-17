import Mesa from './mesa.model.js';
import Reservacion from '../reservaciones/reservacion.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';

// Auxiliar para detectar error de duplicado de MongoDB
const isDuplicateKeyError = (error) => error.code === 11000;

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

//CREAR MESA
export const createMesa = async (req, res) => {
    try {
        const data = req.body;

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para crear mesa',
                });
            }
            if (data.restaurante) {
                const hasAccess = restauranteIds.includes(data.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para crear mesas en este restaurante',
                    });
                }
            } else {
                data.restaurante = restauranteIds[0];
            }
        }

        const ultimaMesa = await Mesa.findOne({ restaurante: data.restaurante })
            .sort({ numeroMesa: -1 })
            .select('numeroMesa');

        data.numeroMesa = (ultimaMesa?.numeroMesa || 0) + 1;

        const mesa = new Mesa(data);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            mesa
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo asignar el numero de mesa. Intenta crearla nuevamente'
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

//OBTENER TODAS LAS MESAS
export const getMesas = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurante } = req.query;
        let query = { disponibilidad: true };

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver mesas',
                });
            }
            if (restaurante) {
                const hasAccess = restauranteIds.includes(restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver las mesas de este restaurante',
                    });
                }
                query.restaurante = restaurante;
            } else {
                query.restaurante = { $in: restauranteIds };
            }
        } else if ((req.usuario.role === 'ADMIN_ROLE' || req.usuario.role === 'USER_ROLE') && restaurante) {
            query.restaurante = restaurante;
        }

        const [mesas, total] = await Promise.all([
            Mesa.find(query)
                .populate('restaurante', 'nombre')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ numeroMesa: 1 }),
            Mesa.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message
        });
    }
};

//OBTENER MESA POR ID
export const getMesaById = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findById(id).populate('restaurante', 'nombre');

        if (!mesa || !mesa.disponibilidad) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada o inactiva'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !mesa.restaurante || !restauranteIds.includes(mesa.restaurante._id.toString())) {
                return res.status(403).json({ success: false, message: 'Acceso denegado a esta mesa' });
            }
        }

        res.status(200).json({ success: true, mesa });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la mesa',
            error: error.message
        });
    }
};

//EDITAR MESA
export const editarMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        delete data.numeroMesa;

        const mesaExistente = await Mesa.findById(id);
        if (!mesaExistente) return res.status(404).json({ message: 'Mesa no encontrada' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !mesaExistente.restaurante || !restauranteIds.includes(mesaExistente.restaurante.toString())) {
                return res.status(403).json({ message: 'No tienes permiso para editar esta mesa' });
            }
            if (data.restaurante) {
                const hasAccess = restauranteIds.includes(data.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({ message: 'No tienes permiso para mover mesa a este restaurante' });
                }
            } else {
                data.restaurante = mesaExistente.restaurante.toString();
            }
        }

        const mesaEditada = await Mesa.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            mesa: mesaEditada
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una mesa con el número ${req.body.numeroMesa} en este restaurante`
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la mesa',
            error: error.message
        });
    }
};

//ELIMINAR MESA (Soft Delete)
export const eliminarMesa = async (req, res) => {
    try {
        const { id } = req.params;

        const mesa = await Mesa.findById(id);
        if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !mesa.restaurante || !restauranteIds.includes(mesa.restaurante.toString())) {
                return res.status(403).json({ message: 'No tienes permiso para eliminar esta mesa' });
            }
        }

        const [reservacionesCanceladas] = await Promise.all([
            Reservacion.updateMany(
                {
                    mesa: id,
                    estado: { $ne: 'CANCELADA' }
                },
                { $set: { estado: 'CANCELADA' } }
            ),
            Mesa.findByIdAndDelete(id)
        ]);

        res.status(200).json({
            success: true,
            message: 'Mesa eliminada exitosamente',
            reservacionesCanceladas: reservacionesCanceladas.modifiedCount || 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la mesa',
            error: error.message
        });
    }
};
