import Factura from './factura.model.js';
import Pedido from '../pedidos/pedido.model.js';
import DetallePedido from '../detallePedidos/detallePedido.model.js';
import { generateFacturaPdf } from '../../helpers/factura-helper.js';
import { sendFacturaPdfEmail } from '../../helpers/email-service.js';

export const createFactura = async (req, res) => {
    try {
        const facturaData = req.body;

        const factura = new Factura(facturaData);
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

        const [facturas, total] = await Promise.all([
            Factura.find()
                .populate('pedido')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Factura.countDocuments(),
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

        const factura = await Factura.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

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
        const factura = await Factura.findByIdAndDelete(id);

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada',
            });
        }

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

/**
 * Descarga el PDF de una factura.
 * GET /:id/pdf
 */
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