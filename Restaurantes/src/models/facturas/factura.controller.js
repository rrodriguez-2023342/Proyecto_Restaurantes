import Factura from './factura.model.js';
import Pedido from '../pedidos/pedido.model.js';
import DetallePedido from '../detallePedidos/detallePedido.model.js';
import { generateFacturaPdf } from '../../helpers/factura-helper.js';
import { sendFacturaPdfEmail } from '../../helpers/email-service.js';

export const createFactura = async (req, res) => {
    try {
        const { pedido, impuesto = 0 } = req.body;

        // Calcular subtotal sumando los subtotales de cada detalle del pedido
        const detalles = await DetallePedido.find({ pedido });

        if (!detalles.length) {
            return res.status(400).json({
                success: false,
                message: 'El pedido no tiene productos asociados, no se puede generar la factura',
            });
        }

        const subtotal = parseFloat(
            detalles.reduce((acc, d) => acc + (d.precio * d.cantidad), 0).toFixed(2)
        );

        // total se calcula en el pre-save del modelo
        const factura = new Factura({ pedido, subtotal, impuesto });
        await factura.save();

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            data: factura,
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

        // Si es administrador de restaurante, filtrar por su restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            // Buscar pedidos del restaurante
            const pedidosDelRestaurante = await Pedido.find({ restaurante: req.usuario.restaurante }).select('_id');
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

        // Evitar que total se actualice manualmente desde el body
        const { total: _ignorado, ...updateData } = req.body;

        // Si se está actualizando subtotal o impuesto, recalcular total
        const facturaActual = await Factura.findById(id).populate('pedido');
        if (!facturaActual) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

        // Validar que el restaurante sea el propietario de la factura (excepto si es ADMIN_ROLE)
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!req.usuario.restaurante || facturaActual.pedido.restaurante.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar esta factura',
                });
            }
        }

        const subtotal = updateData.subtotal ?? facturaActual.subtotal;
        const impuesto = updateData.impuesto ?? facturaActual.impuesto;
        updateData.total = parseFloat((subtotal + impuesto).toFixed(2));

        const factura = await Factura.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

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

        // Validar que el restaurante sea el propietario de la factura (excepto si es ADMIN_ROLE)
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!req.usuario.restaurante || factura.pedido.restaurante.toString() !== req.usuario.restaurante.toString()) {
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

// Descarga el PDF de una factura

export const descargarFacturaPdf = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Factura
        const factura = await Factura.findById(id);
        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

        // 2. Pedido con restaurante populado
        const pedido = await Pedido.findById(factura.pedido)
            .populate('restaurante', 'nombre');
        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido asociado a la factura no encontrado',
            });
        }

        // 3. Detalles del pedido con plato populado
        const detalles = await DetallePedido.find({ pedido: pedido._id })
            .populate('plato', 'nombrePlato tipoPlato');

        // 4. Generar PDF
        const pdfBuffer = generateFacturaPdf(factura, pedido, detalles);

        // 5. Enviar por correo — fallo no bloquea la descarga
        if (req.usuario?.email) {
            const userName = req.usuario.name ?? 'Usuario';
            sendFacturaPdfEmail(req.usuario.email, userName, pdfBuffer, factura, pedido)
                .catch((err) =>
                    console.error(`[descargarFacturaPdf] Error al enviar email factura ${factura._id}:`, err.message)
                );
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