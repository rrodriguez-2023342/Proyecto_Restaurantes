import mongoose from 'mongoose';
import Pedido from './pedido.model.js';
import DetallePedido from '../detallePedidos/detallePedido.model.js';
import Factura from '../facturas/factura.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Plato from '../platos/plato.model.js';
import Inventario from '../inventario/inventario.model.js';
import { sendPedidoEmail } from '../../helpers/email-service.js';

const notificar = (email, name, accion, pedido, restaurante) => {
    sendPedidoEmail(email, name, accion, pedido, restaurante)
        .catch(err => console.error(`[pedido] Error al enviar correo (${accion}):`, err.message));
};

const getAdminRestaurantId = async (usuario) => {
    if (!usuario || (usuario.role !== 'ADMIN_RESTAURANT_ROLE' && usuario.role !== 'ADMIN_ROLE')) return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const userId = usuario.id;
    // Intentar buscar por string
    let restaurante = await Restaurante.findOne({ dueño: String(userId) }).select('_id').lean();
    
    // Si no, intentar por número si aplica
    if (!restaurante && !isNaN(Number(userId))) {
        restaurante = await Restaurante.findOne({ dueño: Number(userId) }).select('_id').lean();
    }
    
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

const isOrderOwner = (pedido, usuario) => {
    const sameUserId = String(pedido.usuario) === String(usuario.id);
    const sameEmail = pedido.email && usuario.email && String(pedido.email).toLowerCase() === String(usuario.email).toLowerCase();
    return sameUserId || sameEmail;
};

export const createPedido = async (req, res) => {
    try {
        let { restaurante } = req.body;
        const { items, direccionEntrega, notas, tipoPedido, cliente, email, telefono, metodoPago } = req.body;
        const usuarioId = String(req.usuario.id || req.usuario._id);

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'El pedido debe tener al menos un item' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para crear pedidos',
                });
            }

            if (restaurante && String(restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes crear pedidos para otro restaurante',
                });
            }

            restaurante = adminRestaurantId;
        }

        // 1. Calcular total y preparar items del detalle
        let total = 0;
        const formattedItems = items.map(item => {
            const precio = Number(item.precio || item.precioUnitario || 0);
            const cantidad = Number(item.cantidad || 1);
            total += precio * cantidad;
            return {
                plato: item.plato || item.id,
                cantidad: cantidad,
                precio: precio
            };
        });

        // 2. Crear el Pedido
        const clienteEmail = email || req.usuario.email || '';
        const clienteNombre = cliente || req.usuario.name || 'Cliente';

        const nuevoPedido = new Pedido({
            restaurante,
            usuario: usuarioId,
            tipoPedido: tipoPedido || 'Domicilio',
            cliente: clienteNombre,
            email: clienteEmail,
            telefono: telefono || '',
            direccionEntrega: direccionEntrega || 'Dirección no especificada',
            notas: notas || '',
            totalPedido: total
        });

        const pedidoGuardado = await nuevoPedido.save();

        // 3. Crear el DetallePedido
        const nuevoDetalle = new DetallePedido({
            pedido: pedidoGuardado._id,
            items: formattedItems
        });

        await nuevoDetalle.save();

        // 4. Crear la Factura automáticamente
        const nuevaFactura = new Factura({
            pedido: pedidoGuardado._id,
            subtotal: total,
            propina: 0,
            correoCliente: clienteEmail || null,
            metodoPago: metodoPago || null,
            estado: 'PENDIENTE'
        });
        await nuevaFactura.save();

        // 5. Restar inventario automáticamente
        try {
            for (const item of formattedItems) {
                // Leemos directamente desde la colección de MongoDB para evitar que Mongoose borre los datos en modo estricto
                const rawPlato = await Plato.collection.findOne({ _id: new mongoose.Types.ObjectId(item.plato) });
                
                if (rawPlato && rawPlato.ingredientes) {
                    let ingredientesList = rawPlato.ingredientes;
                    
                    // Si viene como un string (texto gigante) lo convertimos a array real
                    if (typeof ingredientesList === 'string') {
                        try {
                            ingredientesList = JSON.parse(ingredientesList);
                        } catch (e) {
                            ingredientesList = [];
                        }
                    }

                    if (Array.isArray(ingredientesList)) {
                        for (const ing of ingredientesList) {
                            // Extraemos el ID ya sea que venga como objeto populado o texto
                            const itemId = ing.itemInventario?._id || ing.itemInventario;
                            
                            if (itemId) {
                                const inventarioItem = await Inventario.findById(itemId);
                                if (inventarioItem) {
                                    inventarioItem.cantidad -= (Number(ing.cantidad) * Number(item.cantidad));
                                    if (inventarioItem.cantidad < 0) inventarioItem.cantidad = 0; // Evitar negativos
                                    await inventarioItem.save();
                                }
                            }
                        }
                    }
                }
            }
        } catch (invError) {
            console.error('[createPedido] Error al restar inventario:', invError.message);
        }

        // 6. Notificar
        try {
            const rest = await Restaurante.findById(restaurante).select('nombre').lean();
            notificar(clienteEmail, clienteNombre, 'creado', pedidoGuardado, rest?.nombre || 'Restaurante');
        } catch (mailErr) {
            console.error('[createPedido] Error en notificación:', mailErr.message);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Pedido creado exitosamente', 
            data: pedidoGuardado 
        });
    } catch (error) {
        console.error('[createPedido] Error:', error);
        res.status(400).json({ success: false, message: 'Error al crear el pedido', error: error.message });
    }
};

export const getPedidos = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const { restaurante } = req.query;
        let query = {};

        if (req.usuario.role === 'USER_ROLE') {
            query = { usuario: String(req.usuario.id) };
            if (req.usuario.email) {
                query = {
                    $or: [
                        { usuario: String(req.usuario.id) },
                        { email: { $regex: new RegExp(`^${String(req.usuario.email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
                    ]
                };
            }
        } else if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver pedidos',
                });
            }
            if (restaurante) {
                const hasAccess = restauranteIds.includes(restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver los pedidos de este restaurante',
                    });
                }
                query.restaurante = restaurante;
            } else {
                query.restaurante = { $in: restauranteIds };
            }
        } else if (restaurante) {
            query.restaurante = restaurante;
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

        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(pedido, req.usuario)) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para ver este pedido' });
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

        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(pedidoExistente, req.usuario)) {
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

        const currentStatus = String(pedidoExistente.estadoPedido || '').toLowerCase();
        const requestedStatus = pedidoData.estadoPedido ? String(pedidoData.estadoPedido).toLowerCase() : null;

        if (currentStatus === 'entregado' && requestedStatus && requestedStatus !== 'entregado') {
            return res.status(400).json({ success: false, message: 'No puedes cambiar el estado de un pedido ya entregado' });
        }

        if (req.usuario.role === 'USER_ROLE') {
            const allowedFields = ['direccionEntrega', 'notas', 'telefono'];
            const updatePayload = {};

            for (const key of allowedFields) {
                if (key in pedidoData) {
                    updatePayload[key] = pedidoData[key];
                }
            }

            if (requestedStatus === 'entregado' && currentStatus !== 'entregado') {
                updatePayload.estadoPedido = 'Entregado';
            } else if (requestedStatus && requestedStatus !== 'entregado') {
                return res.status(400).json({ success: false, message: 'No puedes cambiar el estado del pedido a ese valor' });
            }

            Object.assign(pedidoData, updatePayload);
        }

        delete pedidoData.totalPedido;

        const pedidoEditado = await Pedido.findByIdAndUpdate(id, pedidoData, { new: true, runValidators: true });

        if (String(pedidoEditado.estadoPedido || '').toLowerCase() === 'entregado') {
            await Factura.findOneAndUpdate(
                { pedido: pedidoEditado._id },
                { estado: 'ENTREGADO' },
                { new: true }
            );
        }

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

        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(pedido, req.usuario)) {
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
        await DetallePedido.deleteMany({ pedido: id });
        await Pedido.findByIdAndDelete(id);

        notificar(req.usuario.email, req.usuario.name, 'eliminado', pedido, restaurante?.nombre ?? 'Restaurante');

        res.status(200).json({ success: true, message: 'Pedido eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar el pedido', error: error.message });
    }
};
