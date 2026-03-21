import Reservacion from './reservacion.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Mesa from '../mesas/mesa.model.js';
import { validarMesaParaReservacion } from '../../helpers/reservacion.helper.js';
import { sendReservacionEmail } from '../../helpers/email-service.js';

const getRestauranteId = async (usuario) => {
    if (usuario.restaurante) return usuario.restaurante;
    const r = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return r?._id ?? null;
};

// Dispara el correo sin bloquear la respuesta
const notificar = (email, name, accion, reservacion, restaurante) => {
    sendReservacionEmail(email, name, accion, reservacion, restaurante)
        .catch(err => console.error(`[reservacion] Error al enviar correo (${accion}):`, err.message));
};

export const createReservacion = async (req, res) => {
    try {
        const data = req.body;
        const validacionMesa = await validarMesaParaReservacion({
            mesaId: data.mesa,
            restauranteId: data.restaurante,
            fecha: data.fecha,
            cantidadPersonas: data.cantidadPersonas
        });

        if (!validacionMesa.ok) {
            return res.status(validacionMesa.status).json(validacionMesa.payload);
        }

        data.usuario = String(req.usuario.id || req.usuario._id);

        const reservacion = new Reservacion(data);
        await reservacion.save();

        const restaurante = await Restaurante.findById(data.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'creada', reservacion, restaurante?.nombre ?? 'Restaurante');

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: reservacion
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear la reservación', error: error.message });
    }
};

export const getReservaciones = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = { estado: { $ne: 'CANCELADA' } };

        if (req.usuario.role === 'USER_ROLE') {
            query.usuario = req.usuario._id;
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            query.restaurante = restauranteId;
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

        res.status(200).json({ success: true, total, data: reservaciones });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getReservacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id).populate('restaurante mesa usuario');

        if (!reservacion) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE') {
            const usuarioId    = (reservacion.usuario?._id ?? reservacion.usuario)?.toString?.() ?? '';
            const currentUserId = (req.usuario._id ?? req.usuario.id)?.toString?.() ?? '';
            if (usuarioId !== currentUserId) {
                return res.status(403).json({ message: 'No tienes permiso para ver esta reservación' });
            }
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            const resRestauranteId = (reservacion.restaurante?._id ?? reservacion.restaurante)?.toString();
            if (resRestauranteId !== restauranteId.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para ver esta reservación' });
            }
        }

        res.status(200).json({ success: true, data: reservacion });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacionExistente = await Reservacion.findById(id);

        if (!reservacionExistente) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE') {
            const autorId       = (reservacionExistente.usuario?._id ?? reservacionExistente.usuario)?.toString?.() ?? '';
            const currentUserId = (req.usuario._id ?? req.usuario.id)?.toString?.() ?? '';
            if (autorId !== currentUserId) {
                return res.status(403).json({ message: 'No puedes editar una reservación ajena' });
            }
            if (reservacionExistente.estado !== 'PENDIENTE') {
                return res.status(400).json({ message: 'Solo puedes editar reservaciones en estado PENDIENTE' });
            }
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            const resRestauranteId = (reservacionExistente.restaurante?._id ?? reservacionExistente.restaurante)?.toString?.() ?? '';
            if (resRestauranteId !== restauranteId.toString()) {
                return res.status(403).json({ message: 'Solo puedes editar reservaciones de tu restaurante' });
            }
        } else {
            return res.status(403).json({
                message: 'Solo el usuario que hizo la reservacion o el admin del restaurante puede editar',
            });
        }

        if (req.usuario.role === 'USER_ROLE' && req.body.estado != null) {
            if (['CONFIRMADA', 'COMPLETADA'].includes(req.body.estado)) {
                return res.status(403).json({ message: 'Solo el restaurante puede confirmar o marcar como completada la reservación' });
            }
        }

        const mesaId          = req.body.mesa ?? reservacionExistente.mesa;
        const restauranteId   = reservacionExistente.restaurante;
        const fecha           = req.body.fecha ? new Date(req.body.fecha) : reservacionExistente.fecha;
        const cantidadPersonas = req.body.cantidadPersonas ?? reservacionExistente.cantidadPersonas;
        const debeRevalidar   = req.body.mesa != null || req.body.fecha != null || req.body.cantidadPersonas != null;

        if (debeRevalidar) {
            const validacionMesa = await validarMesaParaReservacion({ mesaId, restauranteId, fecha, cantidadPersonas });
            if (!validacionMesa.ok) {
                return res.status(validacionMesa.status).json(validacionMesa.payload);
            }
        }

        const reservacionEditada = await Reservacion.findByIdAndUpdate(id, req.body, { new: true });

        const restaurante = await Restaurante.findById(reservacionEditada.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'actualizada', reservacionEditada, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Reservación actualizada', data: reservacionEditada });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id);

        if (!reservacion) return res.status(404).json({ message: 'Reservación no encontrada' });

        if (req.usuario.role === 'USER_ROLE') {
            const autorId       = (reservacion.usuario?._id ?? reservacion.usuario)?.toString?.() ?? '';
            const currentUserId = (req.usuario._id ?? req.usuario.id)?.toString?.() ?? '';
            if (autorId !== currentUserId) {
                return res.status(403).json({ message: 'No puedes cancelar una reservación ajena' });
            }
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteId(req.usuario);
            if (!restauranteId) return res.status(403).json({ message: 'No tienes un restaurante asignado' });
            const resRestauranteId = (reservacion.restaurante?._id ?? reservacion.restaurante)?.toString?.() ?? '';
            if (resRestauranteId !== restauranteId.toString()) {
                return res.status(403).json({ message: 'Solo puedes cancelar reservaciones de tu restaurante' });
            }
        } else {
            return res.status(403).json({
                message: 'Solo el usuario que hizo la reservacion o el admin del restaurante puede eliminar',
            });
        }

        reservacion.estado = 'CANCELADA';
        await reservacion.save();

        // Al cancelar la reservacion, la mesa vuelve a estar disponible.
        await Mesa.findByIdAndUpdate(reservacion.mesa, { disponibilidad: true });

        const restaurante = await Restaurante.findById(reservacion.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'cancelada', reservacion, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Reservación cancelada correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
