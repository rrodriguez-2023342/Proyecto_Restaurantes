import Factura from './factura.model.js';
import Pedido from '../pedidos/pedido.model.js';
import DetallePedido from '../detallePedidos/detallePedido.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import { generateFacturaPdf } from '../../helpers/factura-helper.js';
import { sendFacturaPdfEmail } from '../../helpers/email-service.js';

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

export const createFactura = async (req, res) => {
    try {
        const { pedido, propina = 0, correoCliente } = req.body;

        // Buscar el detalle del pedido
        const detalle = await DetallePedido.findOne({ pedido });
        if (!detalle || !detalle.items.length) {
            return res.status(400).json({
                success: false,
                message: 'El pedido no tiene productos asociados, no se puede generar la factura',
            });
        }

        // Calcular subtotal desde los items
        const subtotal = parseFloat(
            detalle.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0).toFixed(2)
        );

        const factura = new Factura({ pedido, subtotal, propina, correoCliente: correoCliente ?? null });
        await factura.save();

        const { _id, ...facturaData } = factura.toObject();

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            facturaId: _id,
            data: facturaData,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la factura',
            error: error.message,
        });
    }
};

export const getFacturas = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

        let query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);

            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para listar facturas',
                });
            }

            const pedidosDelRestaurante = await Pedido.find({ restaurante: adminRestaurantId }).select('_id');
            const pedidoIds = pedidosDelRestaurante.map(p => p._id);
            query.pedido = { $in: pedidoIds };
        }

        const [facturas, total] = await Promise.all([
            Factura.find(query)
                .populate('pedido')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Factura.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: facturas,
            pagination: {
                currentPage: page,
                totalPages:  Math.ceil(total / limit),
                totalItems:  total,
                limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las facturas',
            error: error.message,
        });
    }
};

export const getFacturaById = async (req, res) => {
    try {
        const { id } = req.params;
        const factura = await Factura.findById(id).populate('pedido');

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            data: factura,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la factura',
            error: error.message,
        });
    }
};

export const updateFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { total: _ignorado, ...updateData } = req.body;

        const facturaActual = await Factura.findById(id).populate('pedido');
        if (!facturaActual) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);

            if (!adminRestaurantId || String(facturaActual.pedido.restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar esta factura',
                });
            }
        }

        const subtotal = updateData.subtotal ?? facturaActual.subtotal;
        const propina = updateData.propina ?? facturaActual.propina;
        updateData.total = parseFloat((subtotal + propina).toFixed(2));

        const factura = await Factura.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Factura actualizada exitosamente',
            data: factura,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la factura',
            error: error.message,
        });
    }
};

export const deleteFactura = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findById(id).populate('pedido');
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);

            if (!adminRestaurantId || String(factura.pedido.restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar esta factura',
                });
            }
        }

        await Factura.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Factura eliminada exitosamente',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la factura',
            error: error.message,
        });
    }
};

// Descarga el PDF y lo envía por correo
export const descargarFacturaPdf = async (req, res) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findById(id);
        if (!factura) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }

        const pedido = await Pedido.findById(factura.pedido).populate('restaurante', 'nombre');
        if (!pedido) {
            return res.status(404).json({ success: false, message: 'Pedido asociado no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(pedido.restaurante?._id || pedido.restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para generar el PDF de esta factura',
                });
            }
        }

        const detalle = await DetallePedido.findOne({ pedido: pedido._id })
            .populate('items.plato', 'nombrePlato tipoPlato');

        const items = detalle?.items?.map(item => ({
            plato:    item.plato,
            cantidad: item.cantidad,
            precio:   item.precio,
        })) ?? [];

        const pdfBuffer = generateFacturaPdf(factura, pedido, items);

        // Enviar al admin que descarga
        const nombreAdmin = `${req.usuario.name ?? ''} ${req.usuario.surname ?? ''}`.trim();
        sendFacturaPdfEmail(req.usuario.email, nombreAdmin, pdfBuffer, factura, pedido)
            .catch(err => console.error('[descargarFacturaPdf] Error email admin:', err.message));

        // Enviar al cliente si tiene correo guardado
        if (factura.correoCliente) {
            sendFacturaPdfEmail(factura.correoCliente, 'Cliente', pdfBuffer, factura, pedido)
                .catch(err => console.error('[descargarFacturaPdf] Error email cliente:', err.message));
        }

        const filename = `factura-${factura._id.toString().slice(-8).toUpperCase()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdfBuffer);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al generar el PDF de la factura',
            error: error.message,
        });
    }
};
