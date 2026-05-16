import DetallePedido from './detallePedido.model.js';
import Pedido from '../pedidos/pedido.model.js';
import Plato from '../platos/plato.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Factura from '../facturas/factura.model.js';
import Inventario from '../inventario/inventario.model.js';
import { generateFacturaPdf } from '../../helpers/factura-helper.js';
import { sendFacturaPdfEmail, sendPedidoEmail } from '../../helpers/email-service.js';

const serializeDetallePedido = (detalleDoc) => {
    if (!detalleDoc) return null;

    const detalle = typeof detalleDoc.toObject === 'function'
        ? detalleDoc.toObject()
        : { ...detalleDoc };

    const detallePedidoId = detalle._id?.toString?.() || detalle.id?.toString?.();

    return {
        detallePedidoId,
        ...detalle,
    };
};

// Recalcula el totalPedido
const recalcularTotalPedido = async (pedidoId) => {
    const detalle = await DetallePedido.findOne({ pedido: pedidoId });
    if (!detalle) {
        await Pedido.findByIdAndUpdate(pedidoId, { totalPedido: 0 });
        return;
    }
    const total = detalle.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    await Pedido.findByIdAndUpdate(pedidoId, {
        totalPedido: parseFloat(total.toFixed(2)),
    });
};

const getAuthUserId = (usuario) => String(usuario?.id || usuario?._id || usuario?.sub || '');

const isOrderOwner = (pedido, usuario) => {
    const usuarioId = getAuthUserId(usuario).trim();
    const usuarioEmail = String(usuario?.email || '').toLowerCase().trim();
    const pedidoUsuarioId = String(pedido?.usuario || pedido?.user || '').trim();
    const pedidoEmail = String(pedido?.email || pedido?.correoCliente || pedido?.userEmail || '').toLowerCase().trim();
    
    const sameUserId = usuarioId && pedidoUsuarioId && usuarioId === pedidoUsuarioId;
    const sameEmail = usuarioEmail && pedidoEmail && usuarioEmail === pedidoEmail;
    const emailMatchesPedidoUsuario = usuarioEmail && pedidoUsuarioId && usuarioEmail === pedidoUsuarioId.toLowerCase();
    const userIdMatchesPedidoEmail = usuarioId && pedidoEmail && usuarioId === pedidoEmail;
    
    return sameUserId || sameEmail || emailMatchesPedidoUsuario || userIdMatchesPedidoEmail;
};

const canViewDetallePedido = async (usuario, pedidoDoc) => {
    const authUserId = getAuthUserId(usuario);
    const pedidoRestaurantId = String(pedidoDoc?.restaurante || '');

    if (usuario?.role === 'ADMIN_ROLE') {
        return { allowed: true };
    }

    if (usuario?.role === 'USER_ROLE') {
        if (!isOrderOwner(pedidoDoc, usuario)) {
            return { allowed: false, message: 'No tienes permiso para ver este detalle de pedido' };
        }
        return { allowed: true };
    }

    if (usuario?.role === 'ADMIN_RESTAURANT_ROLE') {
        let adminRestaurantId = usuario?.restaurante ? String(usuario.restaurante) : null;
        if (!adminRestaurantId) {
            const restaurante = await Restaurante.findOne({ dueño: authUserId }).select('_id').lean();
            adminRestaurantId = restaurante?._id ? String(restaurante._id) : null;
        }

        if (!adminRestaurantId) {
            return { allowed: false, message: 'No tienes un restaurante asignado' };
        }

        if (adminRestaurantId !== pedidoRestaurantId) {
            return { allowed: false, message: 'No tienes permiso para ver pedidos de otro restaurante' };
        }

        return { allowed: true };
    }

    return { allowed: false, message: 'No tienes permiso para ver este detalle de pedido' };
};

export const createDetallePedido = async (req, res) => {
    try {
        const { pedido, items } = req.body;
        const authUserId = getAuthUserId(req.usuario);

        const pedidoExistente = await Pedido.findById(pedido);
        if (!pedidoExistente) {
            return res.status(404).json({
                success: false,
                message: 'El pedido indicado no existe',
            });
        }

        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(pedidoExistente, req.usuario)) {
            return res.status(403).json({
                success: false,
                message: 'Solo el usuario que creo el pedido puede crear el detalle-pedido',
            });
        }

        const access = await canViewDetallePedido(req.usuario, pedidoExistente);
        if (!access.allowed) {
            return res.status(403).json({
                success: false,
                message: access.message,
            });
        }

        const detalleExistente = await DetallePedido.findOne({ pedido });
        if (detalleExistente) {
            return res.status(400).json({
                success: false,
                message: 'Este pedido ya tiene un detalle, usa PUT para modificarlo',
            });
        }

        const itemsConPrecio = [];
        const stockRequirements = new Map(); // Para rastrear el total de ingredientes necesarios

        for (const item of items) {
            const platoObj = await Plato.findById(item.plato).lean();
            if (!platoObj) {
                return res.status(404).json({
                    success: false,
                    message: `Plato con id ${item.plato} no encontrado`,
                });
            }

            // Recopilar requerimientos de inventario
            let ingredientes = [];
            try {
                if (typeof platoObj.ingredientes === 'string') {
                    ingredientes = JSON.parse(platoObj.ingredientes);
                } else if (Array.isArray(platoObj.ingredientes)) {
                    ingredientes = platoObj.ingredientes;
                }
            } catch (e) {
                console.error("Error parsing ingredients for plato:", platoObj._id, e);
            }

            if (ingredientes && ingredientes.length > 0) {
                for (const ing of ingredientes) {
                    if (ing.itemInventario) {
                        const key = String(ing.itemInventario);
                        const totalNeeded = parseFloat(ing.cantidad) * item.cantidad;
                        stockRequirements.set(key, (stockRequirements.get(key) || 0) + totalNeeded);
                    }
                }
            }

            itemsConPrecio.push({
                plato: item.plato,
                cantidad: item.cantidad,
                precio: platoObj.precio,
            });
        }

        // Verificar stock de todos los ingredientes
        for (const [itemId, needed] of stockRequirements.entries()) {
            const itemInv = await Inventario.findById(itemId);
            if (!itemInv) {
                return res.status(404).json({
                    success: false,
                    message: `Ítem de inventario con ID ${itemId} no encontrado`,
                });
            }
            if (itemInv.cantidad < needed) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para ${itemInv.nombreItem}. Requerido: ${needed}, Disponible: ${itemInv.cantidad}`,
                });
            }
        }

        // Descontar stock (si llegamos aquí, todo el stock está verificado)
        for (const [itemId, needed] of stockRequirements.entries()) {
            await Inventario.findByIdAndUpdate(itemId, { $inc: { cantidad: -needed } });
        }

        const detalle = new DetallePedido({ pedido, items: itemsConPrecio });
        await detalle.save();

        const existingFactura = await Factura.findOne({ pedido });
        if (!existingFactura) {
            const subtotalFactura = parseFloat(
                itemsConPrecio.reduce((acc, item) => acc + item.precio * item.cantidad, 0).toFixed(2)
            );

            const pedidoPopulated = await Pedido.findById(pedido).populate('restaurante', 'nombre');
            const factura = new Factura({
                pedido,
                subtotal: subtotalFactura,
                propina: 0,
                correoCliente: req.usuario?.email ?? null,
            });
            await factura.save();

            const detalleConPlato = await DetallePedido.findById(detalle._id).populate('items.plato', 'nombrePlato');
            const itemsForPdf = detalleConPlato.items.map((item) => ({
                nombre: item.plato?.nombrePlato || '',
                cantidad: item.cantidad,
                precio: item.precio,
            }));

            const pdfBuffer = generateFacturaPdf(factura, pedidoPopulated, itemsForPdf);
            sendFacturaPdfEmail(
                req.usuario?.email,
                req.usuario?.name || 'Cliente',
                pdfBuffer,
                factura,
                pedidoPopulated
            ).catch((err) => console.error('[createDetallePedido] Error al enviar factura por email:', err.message));
        }

        await recalcularTotalPedido(pedido);
        const pedidoActualizado = await Pedido.findById(pedido).populate('restaurante', 'nombre');
        sendPedidoEmail(
            req.usuario?.email,
            req.usuario?.name || 'Cliente',
            'creado',
            pedidoActualizado,
            pedidoActualizado?.restaurante?.nombre ?? 'Restaurante'
        ).catch((err) => console.error('[createDetallePedido] Error al enviar pedido por email:', err.message));

        const { _id, ...detalleData } = detalle.toObject();

        res.status(201).json({
            success: true,
            message: 'Detalle de pedido creado exitosamente',
            detallePedidoId: _id,
            pedidoId: pedido,
            totalPedido: pedidoActualizado.totalPedido,
            data: detalleData,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el detalle del pedido',
            error: error.message,
        });
    }
};

export const getDetallesPedidos = async (req, res) => {
    try {
        const { page = 1, limit = 10, restaurante } = req.query;
        let pedidoFilter = {};

        if (req.usuario?.role === 'USER_ROLE') {
            const userId = getAuthUserId(req.usuario);
            const userEmail = String(req.usuario?.email || '').trim();
            pedidoFilter = userEmail
                ? {
                    $or: [
                        { usuario: userId },
                        { email: { $regex: new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                    ],
                }
                : { usuario: userId };
        }

        if (req.usuario?.role === 'ADMIN_RESTAURANT_ROLE') {
            let adminRestaurantId = req.usuario?.restaurante ? String(req.usuario.restaurante) : null;
            if (!adminRestaurantId) {
                const restaurante = await Restaurante.findOne({ dueño: getAuthUserId(req.usuario) }).select('_id').lean();
                adminRestaurantId = restaurante?._id ? String(restaurante._id) : null;
            }

            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado',
                });
            }

            pedidoFilter.restaurante = adminRestaurantId;
        } else if (restaurante) {
            pedidoFilter.restaurante = restaurante;
        }

        const allowedPedidos = await Pedido.find(pedidoFilter).select('_id').lean();
        const allowedPedidoIds = allowedPedidos.map((pedido) => pedido._id);
        const detailFilter = req.usuario?.role === 'ADMIN_ROLE'
            ? {}
            : { pedido: { $in: allowedPedidoIds } };

        const [detalles, total] = await Promise.all([
            DetallePedido.find(detailFilter)
                .populate('pedido', 'numeroPedido tipoPedido estadoPedido totalPedido restaurante')
                .populate('items.plato', 'nombrePlato precio')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            DetallePedido.countDocuments(detailFilter),
        ]);

        const orphanDetailIds = detalles
            .filter((detalle) => !detalle.pedido)
            .map((detalle) => detalle._id);

        if (orphanDetailIds.length) {
            await DetallePedido.deleteMany({ _id: { $in: orphanDetailIds } });
        }

        const validDetails = detalles.filter((detalle) => detalle.pedido);

        res.status(200).json({
            success: true,
            data: validDetails.map(serializeDetallePedido),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de pedidos',
            error: error.message,
        });
    }
};

// GET por _id del detalle
export const getDetallePedidoById = async (req, res) => {
    try {
        const { id } = req.params;
        const detalle = await DetallePedido.findById(id)
            .populate('pedido', 'tipoPedido estadoPedido totalPedido restaurante usuario email')
            .populate('items.plato', 'nombrePlato precio');

        if (!detalle || !detalle.pedido) {
            if (detalle && !detalle.pedido) {
                await DetallePedido.findByIdAndDelete(id);
            }
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado',
            });
        }

        const access = await canViewDetallePedido(req.usuario, detalle.pedido);
        if (!access.allowed) {
            return res.status(403).json({
                success: false,
                message: access.message,
            });
        }

        res.status(200).json({
            success: true,
            data: serializeDetallePedido(detalle),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle de pedido',
            error: error.message,
        });
    }
};

// GET por pedidoId para generar la factura
export const getDetallePedidoByPedido = async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const detalle = await DetallePedido.findOne({ pedido: pedidoId })
            .populate('pedido', 'tipoPedido estadoPedido totalPedido restaurante usuario email')
            .populate('items.plato', 'nombrePlato precio');

        if (!detalle || !detalle.pedido) {
            if (detalle && !detalle.pedido) {
                await DetallePedido.findByIdAndDelete(detalle._id);
            }
            return res.status(404).json({
                success: false,
                message: 'No se encontro detalle para este pedido',
            });
        }

        const access = await canViewDetallePedido(req.usuario, detalle.pedido);
        if (!access.allowed) {
            return res.status(403).json({
                success: false,
                message: access.message,
            });
        }

        res.status(200).json({
            success: true,
            data: serializeDetallePedido(detalle),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el detalle del pedido',
            error: error.message,
        });
    }
};

export const updateDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        const detalle = await DetallePedido.findById(id).populate('pedido');
        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado',
            });
        }

        const authUserId = getAuthUserId(req.usuario);
        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(detalle.pedido, req.usuario)) {
            return res.status(403).json({
                success: false,
                message: 'Solo el usuario que creo el pedido puede editar el detalle',
            });
        }

        const access = await canViewDetallePedido(req.usuario, detalle.pedido);
        if (!access.allowed) {
            return res.status(403).json({
                success: false,
                message: access.message,
            });
        }

        const itemsConPrecio = [];
        for (const item of items) {
            const platoObj = await Plato.findById(item.plato).lean();
            if (!platoObj) {
                return res.status(404).json({
                    success: false,
                    message: `Plato con id ${item.plato} no encontrado`,
                });
            }
            itemsConPrecio.push({
                plato: item.plato,
                cantidad: item.cantidad,
                precio: platoObj.precio,
            });
        }

        const detalleActualizado = await DetallePedido.findByIdAndUpdate(
            id,
            { items: itemsConPrecio },
            { new: true, runValidators: true }
        ).populate('items.plato', 'nombrePlato precio');

        await recalcularTotalPedido(detalle.pedido._id);
        const pedidoActualizado = await Pedido.findById(detalle.pedido._id);

        res.status(200).json({
            success: true,
            message: 'Detalle de pedido actualizado exitosamente',
            totalPedido: pedidoActualizado.totalPedido,
            data: serializeDetallePedido(detalleActualizado),
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el detalle de pedido',
            error: error.message,
        });
    }
};

export const deleteDetallePedido = async (req, res) => {
    try {
        const { id } = req.params;

        const detalle = await DetallePedido.findById(id).populate('pedido');
        if (!detalle) {
            return res.status(404).json({
                success: false,
                message: 'Detalle de pedido no encontrado',
            });
        }

        const authUserId = getAuthUserId(req.usuario);
        if (req.usuario.role === 'USER_ROLE' && !isOrderOwner(detalle.pedido, req.usuario)) {
            return res.status(403).json({
                success: false,
                message: 'Solo el usuario que creo el pedido puede eliminar el detalle',
            });
        }

        const access = await canViewDetallePedido(req.usuario, detalle.pedido);
        if (!access.allowed) {
            return res.status(403).json({
                success: false,
                message: access.message,
            });
        }

        const pedidoId = detalle.pedido._id;
        await DetallePedido.findByIdAndDelete(id);
        await recalcularTotalPedido(pedidoId);

        res.status(200).json({
            success: true,
            message: 'Detalle de pedido eliminado exitosamente',
            detallePedidoId: id,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el detalle de pedido',
            error: error.message,
        });
    }
};
