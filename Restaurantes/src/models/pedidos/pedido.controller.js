import Pedido from './pedido.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import { sendPedidoEmail } from '../../helpers/email-service.js';

const notificar = (email, name, accion, pedido, restaurante) => {
    sendPedidoEmail(email, name, accion, pedido, restaurante)
        .catch(err => console.error(`[pedido] Error al enviar correo (${accion}):`, err.message));
};

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

const getRestaurantesFromUser = async (usuario) => {
    if (!usuario || (usuario.role !== 'ADMIN_RESTAURANT_ROLE' && usuario.role !== 'ADMIN_ROLE')) return [];
    
    const userId = usuario.id || usuario._id || usuario.uid || "";
    const queryConditions = [];
    
    if (userId) {
        queryConditions.push({ dueño: String(userId) });
        if (!isNaN(Number(userId))) {
            queryConditions.push({ dueño: Number(userId) });
        }
    }
    if (usuario.restaurante) {
        queryConditions.push({ _id: usuario.restaurante });
    }
    
    if (queryConditions.length === 0) return [];
    
    const list = await Restaurante.find({ $or: queryConditions }).select('_id').lean();
    return list.map(r => r._id.toString());
};

export const createPedido = async (req, res) => {
    try {
        const data = req.body;
        data.usuario     = String(req.usuario.id || req.usuario._id);
        data.email       = data.email || req.usuario.email || '';
        data.totalPedido = 0;

        const pedido = new Pedido(data);
        await pedido.save();

        res.status(201).json({ success: true, message: 'Pedido creado exitosamente', data: pedido });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al crear el pedido', error: error.message });
    }
};

export const getPedidos = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        let query = {};

        if (req.usuario.role === 'USER_ROLE') {
            query.usuario = req.usuario.id;
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver pedidos',
                });
            }
            query.restaurante = { $in: restauranteIds };
        }

        const [pedidos, total] = await Promise.all([
            Pedido.find(query)
                .populate('restaurante', 'nombre')
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Pedido.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: pedidos,
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, limit }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener los pedidos', error: error.message });
    }
};

export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findById(id)
            .populate('restaurante', 'nombre');

        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            const orderRestaurantId = String(pedido.restaurante?._id || pedido.restaurante);
            if (!restauranteIds || restauranteIds.length === 0 || !restauranteIds.includes(orderRestaurantId)) {
                return res.status(403).json({ success: false, message: 'No tienes permiso para ver este pedido' });
            }
        }

        res.status(200).json({ success: true, message: 'Pedido obtenido exitosamente', data: pedido });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el pedido', error: error.message });
    }
};

export const editarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoData = req.body;

        const pedidoExistente = await Pedido.findById(id);
        if (!pedidoExistente) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        if (req.usuario.role === 'USER_ROLE' && pedidoExistente.usuario.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({ success: false, message: 'No puedes editar un pedido ajeno' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            const orderRestaurantId = String(pedidoExistente.restaurante?._id || pedidoExistente.restaurante);
            if (!restauranteIds || restauranteIds.length === 0 || !restauranteIds.includes(orderRestaurantId)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar pedidos de este restaurante',
                });
            }
        }

        delete pedidoData.totalPedido;

        const pedidoEditado = await Pedido.findByIdAndUpdate(id, pedidoData, { new: true, runValidators: true });

        const restaurante = await Restaurante.findById(pedidoEditado.restaurante).select('nombre').lean();
        notificar(req.usuario.email, req.usuario.name, 'actualizado', pedidoEditado, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Pedido editado exitosamente', data: pedidoEditado });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al editar el pedido', error: error.message });
    }
};

export const eliminarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findById(id);
        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        if (req.usuario.role === 'USER_ROLE' && pedido.usuario.toString() !== req.usuario.id.toString()) {
            return res.status(403).json({ success: false, message: 'No puedes eliminar un pedido ajeno' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            const orderRestaurantId = String(pedido.restaurante?._id || pedido.restaurante);
            if (!restauranteIds || restauranteIds.length === 0 || !restauranteIds.includes(orderRestaurantId)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar pedidos de este restaurante',
                });
            }
        }

        const restaurante = await Restaurante.findById(pedido.restaurante).select('nombre').lean();
        await Pedido.findByIdAndDelete(id);

        notificar(req.usuario.email, req.usuario.name, 'eliminado', pedido, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Pedido eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar el pedido', error: error.message });
    }
};
