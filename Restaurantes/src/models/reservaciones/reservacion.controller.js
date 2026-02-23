import Reservacion from './reservacion.model.js';

//Crear Reservaciones.
export const createReservacion = async (req, res) => {
    try {
        const data = req.body;
        // Forzar que usuario sea siempre string
        data.usuario = String(req.usuario.id || req.usuario._id);

        const reservacion = new Reservacion(data);
        await reservacion.save();

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservacion
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        });
    }
};

//OBTENER RESERVACIONES
//Regla Scrum: USER_ROLE solo ve las suyas. Admins ven todas o por restaurante.

export const getReservaciones = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = { estado: { $ne: 'CANCELADA' } };

        if (req.usuario.role === 'USER_ROLE') {
            query.usuario = req.usuario._id;
        } 
        else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            query.restaurante = req.usuario.restaurante;
        }

        const [reservaciones, total] = await Promise.all([
            Reservacion.find(query)
                .populate('restaurante', 'nombre')
                .populate('mesa', 'numeroMesa')
                .populate('usuario', 'nombre apellido')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ fecha: 1 }),
            Reservacion.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            total,
            data: reservaciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

//OBTENER POR ID (Con validación de propiedad)

export const getReservacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id)
            .populate('restaurante mesa usuario');

        if (!reservacion) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE' && reservacion.usuario._id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta reservación' });
        }

        res.status(200).json({ success: true, data: reservacion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//ACTUALIZAR RESERVACIÓN
//Regla Scrum: USER_ROLE solo si está "PENDIENTE".

export const updateReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacionExistente = await Reservacion.findById(id);

        if (!reservacionExistente) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE') {
            if (reservacionExistente.usuario.toString() !== req.usuario._id.toString()) {
                return res.status(403).json({ message: 'No puedes editar una reservación ajena' });
            }
            if (reservacionExistente.estado !== 'PENDIENTE') {
                return res.status(400).json({ message: 'Solo puedes editar reservaciones en estado PENDIENTE' });
            }
        }

        const reservacionEditada = await Reservacion.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: 'Reservación actualizada',
            data: reservacionEditada
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//CANCELAR/ELIMINAR RESERVACIÓN
//Regla Scrum: USER_ROLE solo puede cancelar la propia.

export const deleteReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id);

        if (!reservacion) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE' && reservacion.usuario.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({ message: 'No puedes cancelar una reservación ajena' });
        }

        reservacion.estado = 'CANCELADA';
        await reservacion.save();

        res.status(200).json({
            success: true,
            message: 'Reservación cancelada correctamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};