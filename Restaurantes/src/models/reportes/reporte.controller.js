import Reporte from './reporte.model.js';
import { generateReportePdf } from '../../helpers/reporte.helper.js';
import { sendReportePdfEmail } from '../../helpers/email-service.js';
import Restaurante from '../restaurantes/restaurante.model.js';

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Verifica que el usuario ADMIN_RESTAURANT_ROLE sea dueño del restaurante
 * asociado al reporte. Devuelve true si tiene permiso, false si no.
 */
const puedeAccederReporte = async (usuario, reporteRestauranteId) => {
    if (usuario.role !== 'ADMIN_RESTAURANT_ROLE') return true;

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).lean();
    return restaurante && reporteRestauranteId.toString() === restaurante._id.toString();
};

const buildFilename = (reporte) =>
    `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte._id}.pdf`;

// ─── Controllers ─────────────────────────────────────────────────────────────

export const createReporte = async (req, res) => {
    try {
        const data = { ...req.body };
        delete data.generadoPor;

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restaurante = await Restaurante.findOne({ dueño: req.usuario.id }).lean();
            if (!restaurante) {
                return res.status(404).json({
                    success: false,
                    message: 'No tienes un restaurante asignado',
                });
            }
            data.restaurante = restaurante._id;
        }

        data.generadoPor = {
            userId: String(req.usuario.id),
            role: req.usuario.role,
        };

        const reporte = await new Reporte(data).save();

        return res.status(201).json({
            success: true,
            message: 'Reporte generado exitosamente',
            data: reporte,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message,
        });
    }
};

export const getReportes = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            query.restaurante = req.usuario.restaurante;
        }

        const [reportes, total] = await Promise.all([
            Reporte.find(query)
                .populate('restaurante', 'nombre')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Reporte.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            data: reportes,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los reportes',
            error: error.message,
        });
    }
};

export const getReporteById = async (req, res) => {
    try {
        const reporte = await Reporte.findById(req.params.id).populate('restaurante');

        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: 'Reporte obtenido exitosamente',
            data: reporte,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte',
            error: error.message,
        });
    }
};

export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const reporteExistente = await Reporte.findById(id);

        if (!reporteExistente) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        if (!(await puedeAccederReporte(req.usuario, reporteExistente.restaurante))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este reporte',
            });
        }

        const updateData = { ...req.body };
        delete updateData.generadoPor; // Campo inmutable, nunca se sobreescribe

        const reporteEditado = await Reporte.findByIdAndUpdate(id, updateData, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Reporte actualizado',
            data: reporteEditado,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al editar el reporte',
            error: error.message,
        });
    }
};

export const deleteReporte = async (req, res) => {
    try {
        const reporteEliminado = await Reporte.findByIdAndDelete(req.params.id);

        if (!reporteEliminado) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: 'Reporte eliminado correctamente',
            data: reporteEliminado,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al eliminar el reporte',
            error: error.message,
        });
    }
};

/**
 * Genera el PDF del reporte, lo descarga y lo envía por correo.
 * Si el correo falla, el PDF se entrega igual — el error se registra en logs.
 */
export const generarReporte = async (req, res) => {
    try {
        const reporte = await Reporte.findById(req.params.id).populate('restaurante', 'nombre');

        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        if (!reporte.restaurante) {
            return res.status(404).json({ success: false, message: 'Restaurante del reporte no encontrado' });
        }

        if (!(await puedeAccederReporte(req.usuario, reporte.restaurante._id))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para descargar este reporte',
            });
        }

        const pdfBuffer = generateReportePdf(reporte);

        // Envío de correo: fallo no bloquea la descarga
        sendReportePdfEmail(req.usuario.email, req.usuario.name, pdfBuffer, reporte)
            .catch((err) =>
                console.error(`[generarReporte] Error al enviar email para reporte ${reporte._id}:`, err.message)
            );

        const filename = buildFilename(reporte);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdfBuffer);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al generar el PDF del reporte',
            error: error.message,
        });
    }
};