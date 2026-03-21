import Evento from './evento.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import { sendEventoEmail } from '../../helpers/email-service.js';

const notificar = (email, name, accion, evento, restaurante) => {
    sendEventoEmail(email, name, accion, evento, restaurante)
        .catch(err => console.error(`[evento] Error al enviar correo (${accion}):`, err.message));
};

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

export const createEvento = async (req, res) => {
    try {
        const eventoData = req.body;

        const evento = new Evento(eventoData);
        await evento.save();

        const restaurante = await Restaurante.findById(eventoData.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'creado', evento, restaurante?.nombre ?? 'Restaurante');

        res.status(201).json({ success: true, message: 'Evento creado exitosamente', data: evento });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear el evento', error: error.message });
    }
};

export const getEventos = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver eventos',
                });
            }
            query.restaurante = adminRestaurantId;
        }

        const [eventos, total] = await Promise.all([
            Evento.find(query)
                .populate('restaurante', 'nombre')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Evento.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: eventos,
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, limit }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los eventos', error: error.message });
    }
};

export const getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findById(id).populate('restaurante', 'nombre');

        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        res.status(200).json({ success: true, data: evento });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al buscar el evento', error: error.message });
    }
};

export const updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const eventoData = req.body;

        const evento = await Evento.findById(id);
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(evento.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para editar este evento' });
            }

            // Evita que un ADMIN_RESTAURANT_ROLE reasigne el evento a otro restaurante
            if (eventoData.restaurante && String(eventoData.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No puedes mover eventos a otro restaurante' });
            }
        }

        const eventoActualizado = await Evento.findByIdAndUpdate(id, eventoData, { new: true, runValidators: true });

        const restaurante = await Restaurante.findById(eventoActualizado.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'actualizado', eventoActualizado, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Evento actualizado exitosamente', data: eventoActualizado });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al actualizar el evento', error: error.message });
    }
};

export const deleteEvento = async (req, res) => {
    try {
        const { id } = req.params;

        const evento = await Evento.findById(id);
        if (!evento) {
            return res.status(404).json({ success: false, message: 'Evento no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(evento.restaurante) !== adminRestaurantId) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este evento' });
            }
        }

        const restaurante = await Restaurante.findById(evento.restaurante).select('nombre').lean();
        await Evento.findByIdAndDelete(id);

        notificar(req.usuario.email, req.usuario.name, 'eliminado', evento, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Evento eliminado exitosamente' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al eliminar el evento', error: error.message });
    }
};
