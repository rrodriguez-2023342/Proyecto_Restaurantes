import { useEffect, useState } from "react";
import { adminTheme } from "../../../constants/theme";
import { getDashboardStats, exportReportCSV, exportReportPDF } from "../../../shared/api/report";
import { EmptyState } from "../../../shared/components";
import { DateRangeFilter } from "../components/DateRangeFilter";

const formatCurrency = (value) =>
    `Q${Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (value) => Number(value || 0).toLocaleString("es-GT");

const emptyStats = {
    ingresosTotales: 0,
    pedidosCompletados: 0,
    ticketPromedio: 0,
    totalPedidos: 0,
    totalPropinas: 0,
    topPlatos: [],
    ingresosPorRestaurante: [],
};

const normalizeStats = (raw = {}) => ({
    ...emptyStats,
    ...raw,
    ingresosTotales: Number(raw.ingresosTotales ?? raw.totalIngresos ?? 0),
    pedidosCompletados: Number(raw.pedidosCompletados ?? raw.pedidosEntregados ?? 0),
    ticketPromedio: Number(raw.ticketPromedio ?? 0),
    totalPedidos: Number(raw.totalPedidos ?? 0),
    totalPropinas: Number(raw.totalPropinas ?? 0),
    topPlatos: Array.isArray(raw.topPlatos) ? raw.topPlatos : [],
    ingresosPorRestaurante: Array.isArray(raw.ingresosPorRestaurante) ? raw.ingresosPorRestaurante : [],
});

const MetricCard = ({ label, value, helper }) => (
    <div className="admin-card rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="mt-2 text-sm font-medium text-slate-500">{helper}</p>
    </div>
);

const SectionPanel = ({ title, subtitle, children }) => (
    <section className="admin-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="admin-panel-heading border-b border-slate-900 px-5 py-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-white">{title}</h2>
            <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
        </div>
        <div className="p-5">{children}</div>
    </section>
);

export const ReportsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [backendError, setBackendError] = useState(null);
    const [filters, setFilters] = useState({ startDate: null, endDate: null });

    const fetchStats = async (currentFilters) => {
        try {
            setLoading(true);
            setBackendError(null);
            const res = await getDashboardStats(currentFilters);
            const data = res.data?.data || res.data;
            setStats(data && Object.keys(data).length > 0 ? normalizeStats(data) : emptyStats);
            if (!data || Object.keys(data).length === 0) setBackendError("El backend respondio sin datos validos.");
        } catch (error) {
            console.debug("Backend report endpoint not available", error);
            setStats(emptyStats);
            setBackendError(error.response?.data?.message || error.message || "No se pudo conectar con el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats(filters);
    }, [filters]);

    const handleExport = async (type) => {
        try {
            setExporting(true);
            const exportFn = type === "csv" ? exportReportCSV : exportReportPDF;
            const response = await exportFn(filters);
            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || (type === "csv" ? "text/csv" : "application/pdf"),
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", type === "csv" ? "reporte-dashboard.csv" : "reporte-dashboard.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.debug("Export endpoint not available", error);
            alert("No fue posible exportar el reporte. Verifica que el backend este disponible.");
        } finally {
            setExporting(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="space-y-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />)}
            </div>
        );
    }

    const data = normalizeStats(stats);
    const completionRate = data.totalPedidos > 0 ? ((data.pedidosCompletados / data.totalPedidos) * 100).toFixed(1) : "0.0";
    const selectedRange = `${filters.startDate || "Desde el inicio"} - ${filters.endDate || "Hasta la fecha"}`;

    return (
        <div className="space-y-6 pb-8">
            <div className="admin-surface rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="admin-kicker">Inteligencia comercial</p>
                    <h2 className={adminTheme.pageTitle}>Reportes</h2>
                    <p className="mt-2 text-sm font-medium text-slate-500">Consulta ingresos, pedidos, propinas y productos destacados.</p>
                </div>
                <span className="w-fit rounded-full bg-slate-950 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                    {selectedRange}
                </span>
            </div>

            <DateRangeFilter onFilter={setFilters} isExporting={exporting} onExportCSV={() => handleExport("csv")} onExportPDF={() => handleExport("pdf")} />

            {backendError && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-800">
                    <strong>No se pudieron cargar metricas reales:</strong> {backendError}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <MetricCard label="Ingresos totales" value={formatCurrency(data.ingresosTotales)} helper="Total facturado en el periodo seleccionado." />
                <MetricCard label="Pedidos" value={formatNumber(data.totalPedidos)} helper="Ordenes procesadas en el rango actual." />
                <MetricCard label="Completados" value={formatNumber(data.pedidosCompletados)} helper={`${completionRate}% de los pedidos fueron entregados.`} />
                <MetricCard label="Ticket promedio" value={formatCurrency(data.ticketPromedio)} helper="Promedio de venta por pedido completado." />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionPanel title="Resumen financiero" subtitle="Vista rapida del dinero que entro y del rango aplicado.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Total propinas</p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(data.totalPropinas)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Rango seleccionado</p>
                            <p className="mt-3 text-sm font-semibold text-slate-900">{selectedRange}</p>
                        </div>
                    </div>
                </SectionPanel>

                <SectionPanel title="Platos mas vendidos" subtitle="Productos con mayor movimiento durante el periodo.">
                    {data.topPlatos.length > 0 ? (
                        <div className="space-y-3">
                            {data.topPlatos.map((plato, idx) => (
                                <div key={plato.id || idx} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{idx + 1}. {plato.nombre}</p>
                                            <p className="text-xs text-slate-500">{formatNumber(plato.cantidad)} vendidos</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(plato.ingresos)}</p>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(Math.max(plato.porcentaje || 0, 2), 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Sin datos de platos" description="No hay datos disponibles para este rango." />
                    )}
                </SectionPanel>
            </div>

            <SectionPanel title="Ingresos por restaurante" subtitle="Comparativa de ingresos entre locales.">
                {data.ingresosPorRestaurante.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {data.ingresosPorRestaurante.map((item, idx) => {
                            const percentage = (Number(item.ingresos || 0) / Math.max(data.ingresosTotales, 1)) * 100;
                            return (
                                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="break-words text-sm font-semibold text-slate-900">{item.restaurante}</p>
                                            <p className="mt-1 text-sm text-slate-500">{formatCurrency(item.ingresos)}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                        <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(Math.max(percentage, 2), 100)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState title="Sin ingresos por restaurante" description="No hay ingresos para mostrar en este rango." />
                )}
            </SectionPanel>
        </div>
    );
};
