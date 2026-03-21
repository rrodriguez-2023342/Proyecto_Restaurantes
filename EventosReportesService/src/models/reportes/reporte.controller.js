import Reporte from './reporte.model.js';
import { generateReportePdf } from '../../helpers/reporte-helper.js';
import { sendReportePdfEmail } from '../../helpers/email-service.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Pedido from '../pedidos/pedido.model.js';
import Factura from '../facturas/factura.model.js';
import DetallePedido from '../detallePedidos/detallePedido.model.js';
import Inventario from '../inventario/inventario.model.js';
import Plato from '../platos/plato.model.js';
import Reservacion from '../reservaciones/reservacion.model.js';
import Mesa from '../mesas/mesa.model.js';
import Reseña from '../reseñas/reseña.model.js';

// ─── Helpers internos ────────────────────────────────────────────────────────

const puedeAccederReporte = async (usuario, reporteRestauranteId) => {
    if (usuario.role !== 'ADMIN_RESTAURANT_ROLE') return true;
    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).lean();
    return restaurante && reporteRestauranteId.toString() === restaurante._id.toString();
};

const getAdminRestaurantId = async (usuario) => {
    if (usuario?.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return String(usuario.restaurante);

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id ? String(restaurante._id) : null;
};

const buildFilename = (reporte) =>
    `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte._id}.pdf`;

// ─── Generadores de data por tipo ────────────────────────────────────────────

/**
 * VENTAS
 * Fuentes: Pedido, Factura, DetallePedido
 * - totalIngresos: métrica principal, suma de lo facturado
 * - totalPedidos: volumen de operaciones del periodo
 * - pedidosEntregados / pedidosCancelados: salud operativa
 * - ticketPromedio: KPI estándar de restaurantes
 * - pedidosPorTipo: saber qué canal genera más (domicilio, llevar, local)
 * - totalPropinas: útil para contabilidad
 */
const generarDataVentas = async (restauranteId, fechaInicio, fechaFin) => {
    const [pedidos, facturas] = await Promise.all([
        Pedido.find({
            restaurante: restauranteId,
            createdAt: { $gte: fechaInicio, $lte: fechaFin },
        }).lean(),
        Factura.find({
            createdAt: { $gte: fechaInicio, $lte: fechaFin },
        }).populate({ path: 'pedido', match: { restaurante: restauranteId } }).lean(),
    ]);

    const facturasDelRestaurante = facturas.filter((f) => f.pedido !== null);

    const totalIngresos     = facturasDelRestaurante.reduce((s, f) => s + (f.total ?? 0), 0);
    const totalPropinas = facturasDelRestaurante.reduce((s, f) => s + (f.propina ?? 0), 0);
    const totalPedidos      = pedidos.length;
    const pedidosEntregados = pedidos.filter((p) => p.estadoPedido === 'Entregado').length;
    const pedidosCancelados = pedidos.filter((p) => p.estadoPedido === 'Cancelado').length;
    const ticketPromedio    = totalPedidos > 0 ? (totalIngresos / totalPedidos).toFixed(2) : '0.00';

    const porTipo = pedidos.reduce((acc, p) => {
        acc[p.tipoPedido] = (acc[p.tipoPedido] ?? 0) + 1;
        return acc;
    }, {});

    return {
        totalIngresos:       totalIngresos.toFixed(2),
        totalPedidos,
        pedidosEntregados,
        pedidosCancelados,
        ticketPromedio,
        totalPropinas: totalPropinas.toFixed(2),
        pedidosDomicilio:    porTipo['Domicilio']            ?? 0,
        pedidosParaLlevar:   porTipo['Para llevar']          ?? 0,
        pedidosEnRestaurante: porTipo['En el restaurante']   ?? 0,
    };
};

/**
 * RESERVACIONES
 * Fuentes: Reservacion, Mesa
 * - totalReservaciones: volumen general
 * - porEstado: tasa de cancelación y cumplimiento
 * - promedioPersonas: para planificar capacidad
 * - totalMesas / mesasDisponibles: ocupación actual del restaurante
 */
const generarDataReservaciones = async (restauranteId, fechaInicio, fechaFin) => {
    const [reservaciones, mesas] = await Promise.all([
        Reservacion.find({
            restaurante: restauranteId,
            fecha: { $gte: fechaInicio, $lte: fechaFin },
        }).lean(),
        Mesa.find({ restaurante: restauranteId }).lean(),
    ]);

    const total        = reservaciones.length;
    const confirmadas  = reservaciones.filter((r) => r.estado === 'CONFIRMADA').length;
    const canceladas   = reservaciones.filter((r) => r.estado === 'CANCELADA').length;
    const completadas  = reservaciones.filter((r) => r.estado === 'COMPLETADA').length;
    const pendientes   = reservaciones.filter((r) => r.estado === 'PENDIENTE').length;

    const sumaPersonas   = reservaciones.reduce((s, r) => s + (r.cantidadPersonas ?? 0), 0);
    const promedioPersonas = total > 0 ? (sumaPersonas / total).toFixed(1) : '0';
    const tasaCancelacion  = total > 0 ? ((canceladas / total) * 100).toFixed(1) + '%' : '0%';

    const totalMesas      = mesas.length;
    const mesasDisponibles = mesas.filter((m) => m.disponibilidad).length;
    const mesasOcupadas   = totalMesas - mesasDisponibles;

    return {
        totalReservaciones: total,
        reservacionesConfirmadas: confirmadas,
        reservacionesCanceladas:  canceladas,
        reservacionesCompletadas: completadas,
        reservacionesPendientes:  pendientes,
        tasaCancelacion,
        promedioPersonasPorReservacion: promedioPersonas,
        totalMesas,
        mesasDisponibles,
        mesasOcupadas,
    };
};

/**
 * INVENTARIO
 * Fuente: Inventario
 * - totalItems: tamaño del inventario
 * - itemsBajoStock: los más críticos, donde cantidad <= minStock
 * - itemsSinStock: alertas inmediatas, donde cantidad === 0
 * - itemCritico: el item con menor cantidad relativa a su minStock
 */
const generarDataInventario = async (restauranteId) => {
    const items = await Inventario.find({ restaurante: restauranteId }).lean();

    const total         = items.length;
    const sinStock      = items.filter((i) => i.cantidad === 0);
    const bajoStock     = items.filter((i) => i.cantidad > 0 && i.cantidad <= i.minStock);
    const stockNormal   = items.filter((i) => i.cantidad > i.minStock);

    // El item más crítico: menor ratio cantidad/minStock (excluyendo los en 0 que ya son críticos)
    const itemCritico = bajoStock.sort(
        (a, b) => (a.cantidad / a.minStock) - (b.cantidad / b.minStock)
    )[0];

    return {
        totalItems:          total,
        itemsStockNormal:    stockNormal.length,
        itemsBajoStock:      bajoStock.length,
        itemsSinStock:       sinStock.length,
        alertasCriticas:     sinStock.length + bajoStock.length,
        itemMasCritico:      itemCritico?.nombreItem ?? 'Ninguno',
        cantidadItemCritico: itemCritico?.cantidad   ?? 0,
        minStockItemCritico: itemCritico?.minStock   ?? 0,
    };
};

/**
 * PLATOS_POPULARES
 * Fuentes: DetallePedido, Plato, Reseña
 * - platosVendidos por nombre: ranking real basado en DetallePedido
 * - ingresosPorPlato: qué plato genera más dinero (cantidad * precio)
 * - porTipoPlato: qué categoría domina (ENTRADA, PLATO_FUERTE, etc.)
 * - calificacionPromedio: satisfacción general del restaurante
 */
const generarDataPlatosPopulares = async (restauranteId, fechaInicio, fechaFin) => {
    // Pedidos del restaurante en el periodo
    const pedidosIds = await Pedido.find({
        restaurante: restauranteId,
        createdAt: { $gte: fechaInicio, $lte: fechaFin },
        estadoPedido: { $ne: 'Cancelado' },
    }).distinct('_id');

    const [detalles, reseñas] = await Promise.all([
        DetallePedido.find({ pedido: { $in: pedidosIds } })
            .populate('plato', 'nombrePlato tipoPlato')
            .lean(),
        Reseña.find({ restaurante: restauranteId, estado: true }).lean(),
    ]);

    // Agrupar por plato
    const mapaPlatos = {};
    for (const d of detalles) {
        if (!d.plato) continue;
        const id = d.plato._id.toString();
        if (!mapaPlatos[id]) {
            mapaPlatos[id] = {
                nombre:    d.plato.nombrePlato,
                tipo:      d.plato.tipoPlato,
                cantidad:  0,
                ingresos:  0,
            };
        }
        mapaPlatos[id].cantidad += d.cantidad;
        mapaPlatos[id].ingresos += d.cantidad * d.precio;
    }

    const ranking = Object.values(mapaPlatos).sort((a, b) => b.cantidad - a.cantidad);

    // Top 3
    const top3 = ranking.slice(0, 3).map((p, i) => ({
        [`top${i + 1}Plato`]:    p.nombre,
        [`top${i + 1}Vendidos`]: p.cantidad,
        [`top${i + 1}Ingresos`]: p.ingresos.toFixed(2),
    }));

    // Por tipo de plato
    const porTipo = {};
    for (const p of ranking) {
        porTipo[p.tipo] = (porTipo[p.tipo] ?? 0) + p.cantidad;
    }

    // Calificación promedio
    const calificacionPromedio = reseñas.length > 0
        ? (reseñas.reduce((s, r) => s + r.calificacion, 0) / reseñas.length).toFixed(1)
        : 'Sin reseñas';

    const totalVendidos = ranking.reduce((s, p) => s + p.cantidad, 0);
    const platoMenosVendido = ranking[ranking.length - 1]?.nombre ?? 'N/A';

    return {
        totalPlatosVendidos:  totalVendidos,
        platoMenosVendido,
        ...Object.assign({}, ...top3),
        entradasVendidas:     porTipo['ENTRADA']       ?? 0,
        platosFuertesVendidos: porTipo['PLATO_FUERTE'] ?? 0,
        postresVendidos:      porTipo['POSTRE']         ?? 0,
        bebidasVendidas:      porTipo['BEBIDA']         ?? 0,
        calificacionPromedio,
        totalReseñas:         reseñas.length,
    };
};

// ─── Dispatcher ──────────────────────────────────────────────────────────────

const generarData = async (tipoReporte, restauranteId, fechaInicio, fechaFin) => {
    switch (tipoReporte) {
        case 'VENTAS':
            return generarDataVentas(restauranteId, fechaInicio, fechaFin);
        case 'RESERVACIONES':
            return generarDataReservaciones(restauranteId, fechaInicio, fechaFin);
        case 'INVENTARIO':
            return generarDataInventario(restauranteId);
        case 'PLATOS_POPULARES':
            return generarDataPlatosPopulares(restauranteId, fechaInicio, fechaFin);
        default:
            return {};
    }
};

// ─── Controllers ─────────────────────────────────────────────────────────────

export const createReporte = async (req, res) => {
    try {
        const data = { ...req.body };
        delete data.generadoPor;
        delete data.data; // El data siempre se genera automáticamente

        // Validar que fechaInicio sea anterior a fechaFin
        const fechaInicio = new Date(data.fechaInicio);
        const fechaFin = new Date(data.fechaFin);
        if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Las fechas de inicio y fin deben ser válidas',
            });
        }
        if (fechaInicio >= fechaFin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin',
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para generar reportes',
                });
            }
            // Si mandan restaurante en body, se ignora y se usa el del admin autenticado.
            data.restaurante = adminRestaurantId;
        }

        data.generadoPor = {
            userId: String(req.usuario.id),
            role:   req.usuario.role,
            name:   `${req.usuario.name ?? ''} ${req.usuario.surname ?? ''}`.trim(),
        };

        // Generar data automáticamente según el tipo de reporte
        data.data = await generarData(
            data.tipoReporte,
            data.restaurante,
            new Date(data.fechaInicio),
            new Date(data.fechaFin)
        );

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
        const page  = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado para ver reportes',
                });
            }
            query.restaurante = adminRestaurantId;
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
                totalItems:  total,
                totalPages:  Math.ceil(total / limit),
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

        // Solo el restaurante que hizo el reporte puede verlo (o ADMIN_ROLE)
        if (!(await puedeAccederReporte(req.usuario, reporte.restaurante?._id ?? reporte.restaurante))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este reporte',
            });
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

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(reporteExistente.restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para editar este reporte',
                });
            }
        } else if (!(await puedeAccederReporte(req.usuario, reporteExistente.restaurante))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para editar este reporte',
            });
        }

        // No permitir editar campos sensibles: solo fechaInicio y fechaFin
        const updateData = {};
        if (req.body.fechaInicio != null) updateData.fechaInicio = req.body.fechaInicio;
        if (req.body.fechaFin != null) updateData.fechaFin = req.body.fechaFin;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden actualizar fechaInicio y fechaFin',
            });
        }
        // Validar que fechaInicio < fechaFin si se envían ambas
        const newInicio = updateData.fechaInicio ? new Date(updateData.fechaInicio) : reporteExistente.fechaInicio;
        const newFin = updateData.fechaFin ? new Date(updateData.fechaFin) : reporteExistente.fechaFin;
        if (new Date(newInicio) >= new Date(newFin)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio debe ser anterior a la fecha de fin',
            });
        }

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
        const reporteExistente = await Reporte.findById(req.params.id);

        if (!reporteExistente) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(reporteExistente.restaurante) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para eliminar este reporte',
                });
            }
        } else if (!(await puedeAccederReporte(req.usuario, reporteExistente.restaurante))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar este reporte',
            });
        }

        const reporteEliminado = await Reporte.findByIdAndDelete(req.params.id);

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

export const generarReporte = async (req, res) => {
    try {
        const reporte = await Reporte.findById(req.params.id).populate('restaurante', 'nombre');

        if (!reporte) {
            return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
        }

        if (!reporte.restaurante) {
            return res.status(404).json({ success: false, message: 'Restaurante del reporte no encontrado' });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const adminRestaurantId = await getAdminRestaurantId(req.usuario);
            if (!adminRestaurantId || String(reporte.restaurante._id) !== adminRestaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para descargar este reporte',
                });
            }
        } else if (!(await puedeAccederReporte(req.usuario, reporte.restaurante._id))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para descargar este reporte',
            });
        }

        const pdfBuffer = generateReportePdf(reporte);

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
