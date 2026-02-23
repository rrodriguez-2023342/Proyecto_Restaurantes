import Reseña from './reseña.model.js'; 

//CREAR RESEÑA

export const createReseña = async (req, res) => {
    try {
        const data = req.body;
        // Forzar que usuario sea siempre string
        data.usuario = String(req.usuario.id || req.usuario._id);

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

        if (req.usuario.role === 'USER_ROLE' && reseñaExistente.usuario.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ message: 'No puedes editar una reseña ajena' });
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

        if (req.usuario.role === 'USER_ROLE') {
            if (reseña.usuario.toString() !== req.usuario._id.toString()) {
                return res.status(403).json({ message: 'No puedes eliminar una reseña ajena' });
            }
            await Reseña.findByIdAndDelete(id);
        } 
        else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            reseña.estado = false; // Ocultar
            await reseña.save();
        } 
        else if (req.usuario.role === 'ADMIN_ROLE') {
            await Reseña.findByIdAndDelete(id);
        }

        res.status(200).json({
            success: true,
            message: 'Reseña eliminada u ocultada correctamente'
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