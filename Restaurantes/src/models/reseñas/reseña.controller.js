import Reseña from './reseña.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';

/** Para ADMIN_RESTAURANT_ROLE obtiene el ID de su restaurante. */
const getRestauranteId = async (usuario) => {
    if (usuario.restaurante) return usuario.restaurante;
    const r = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return r?._id ?? null;
};

//CREAR RESEÑA

export const createReseña = async (req, res) => {
    try {
        const data = req.body;
        const userId = String(req.usuario.id || req.usuario._id);
        data.usuario = userId;

        // Validar que el restaurante exista y esté activo
        const restaurante = await Restaurante.findById(data.restaurante).select('_id isActive').lean();
        if (!restaurante) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }
        if (restaurante.isActive === false) {
            return res.status(400).json({
                success: false,
                message: 'No se pueden crear reseñas para restaurantes inactivos'
            });
        }

        // Una sola reseña activa por usuario por restaurante
        const reseñaExistente = await Reseña.findOne({
            usuario: userId,
            restaurante: data.restaurante,
            estado: true
        }).lean();
        if (reseñaExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya tienes una reseña activa para este restaurante. Puedes editarla en lugar de crear otra.'
            });
        }

        const nuevaReseña = new Reseña(data);
        await nuevaReseña.save();

        res.status(201).json({
            success: true,
            message: 'Reseña creada exitosamente',
            data: nuevaReseña
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reseña',
            error: error.message
        });
    }
};

//OBTENER RESEÑAS

export const getReseñas = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const filter = { estado: true };

        // El restaurante solo puede listar las reseñas de su propio restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            filter.restaurante = restauranteId;
        }

        const [reseñas, total] = await Promise.all([
            Reseña.find(filter)
                .populate('usuario', 'nombre apellido')
                .populate('restaurante', 'nombre')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Reseña.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            data: reseñas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ACTUALIZAR RESEÑA

export const updateReseña = async (req, res) => {
    try {
        const { id } = req.params;
        const reseñaExistente = await Reseña.findById(id);

        if (!reseñaExistente) return res.status(404).json({ message: 'Reseña no encontrada' });

        // Solo el usuario que hizo la reseña puede editarla
        const autorId = (reseñaExistente.usuario?._id ?? reseñaExistente.usuario)?.toString();
        const userId = (req.usuario._id ?? req.usuario.id)?.toString();
        if (autorId !== userId) {
            return res.status(403).json({ message: 'Solo el autor puede editar esta reseña' });
        }

        const reseñaEditada = await Reseña.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: 'Reseña actualizada',
            data: reseñaEditada
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//ELIMINAR / OCULTAR RESEÑA

export const deleteReseña = async (req, res) => {
    try {
        const { id } = req.params;
        const reseña = await Reseña.findById(id);

        if (!reseña) return res.status(404).json({ message: 'Reseña no encontrada' });

        // Solo el usuario que hizo la reseña puede eliminarla
        const autorId = (reseña.usuario?._id ?? reseña.usuario)?.toString();
        const userId = (req.usuario._id ?? req.usuario.id)?.toString();
        if (autorId !== userId) {
            return res.status(403).json({ message: 'Solo el autor puede eliminar esta reseña' });
        }

        await Reseña.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// OBTENER RESEÑA POR ID
export const getReseñaById = async (req, res) => {
    try {
        const { id } = req.params;
        const reseña = await Reseña.findById(id)
            .populate('usuario', 'nombre apellido')
            .populate('restaurante', 'nombre');

        if (!reseña) {
            return res.status(404).json({
                success: false,
                message: 'Reseña no encontrada'
            });
        }

        // El restaurante solo puede ver reseñas de su propio restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            const resRestauranteId = (reseña.restaurante?._id ?? reseña.restaurante)?.toString();
            if (resRestauranteId !== restauranteId.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para ver esta reseña' });
            }
        }

        res.status(200).json({
            success: true,
            data: reseña
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reseña',
            error: error.message
        });
    }
};