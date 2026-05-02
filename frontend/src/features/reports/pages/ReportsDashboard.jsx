import { useState, useEffect } from "react";
import { getDashboardStats, exportReportCSV, exportReportPDF } from "../../../shared/api/report";
import { DateRangeFilter } from "../components/DateRangeFilter";

const formatCurrency = (value) =>
    `Q${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatNumber = (value) => Number(value || 0).toLocaleString('es-GT');

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

const MetricCard = ({ label, value, helper, tone = "slate" }) => {
    const tones = {
        emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-700",
        blue: "border-blue-200 bg-blue-50/80 text-blue-700",
        amber: "border-amber-200 bg-amber-50/80 text-amber-700",
        rose: "border-rose-200 bg-rose-50/80 text-rose-700",
        slate: "border-slate-200 bg-white text-slate-600",
    };

    return (
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
            <div className={`absolute inset-x-0 top-0 h-1.5 ${tone === 'emerald' ? 'bg-emerald-500' : tone === 'blue' ? 'bg-blue-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'rose' ? 'bg-rose-500' : 'bg-slate-900'}`} />
            <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${tones[tone]}`}>
                {label}
            </div>
            <p className="mt-5 whitespace-nowrap text-[clamp(2rem,4vw,3rem)] font-black leading-none tracking-tight text-slate-950">
                {value}
            </p>
            <p className="mt-4 max-w-[18rem] text-sm leading-6 text-slate-600">{helper}</p>
        </div>
    );
};

const SectionPanel = ({ title, subtitle, children }) => (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>
        <div className="p-6">{children}</div>
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
            if (data && Object.keys(data).length > 0) {
                setStats(normalizeStats(data));
            } else {
                setStats(emptyStats);
                setBackendError('El backend respondio sin datos validos.');
            }
        } catch (error) {
            console.debug("Backend report endpoint not available", error);
            setStats(emptyStats);
            setBackendError(error.response?.data?.message || error.message || 'No se pudo conectar con el backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(filters);
    }, [filters]);

    const handleExport = async (type) => {
        try {
            setExporting(true);
            const exportFn = type === 'csv' ? exportReportCSV : exportReportPDF;
            const response = await exportFn(filters);
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || (type === 'csv' ? 'text/csv' : 'application/pdf'),
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', type === 'csv' ? 'reporte-dashboard.csv' : 'reporte-dashboard.pdf');
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
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="mt-4 text-slate-500 font-semibold animate-pulse">Cargando metricas del sistema...</p>
            </div>
        );
    }

    const data = normalizeStats(stats);
    const completionRate = data.totalPedidos > 0
        ? ((data.pedidosCompletados / data.totalPedidos) * 100).toFixed(1)
        : '0.0';
    const selectedRange = `${filters.startDate || 'Desde el inicio'} - ${filters.endDate || 'Hasta la fecha'}`;

    return (
        <div className="space-y-7 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/50 md:p-8">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
                <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
                <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Reportes financieros</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Lectura clara del rendimiento del restaurante</h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            Consulta ingresos, pedidos, propinas y productos destacados sin que la informacion se amontone.
                        </p>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                        <p className="text-sm font-bold text-slate-300">Ingresos del periodo</p>
                        <p className="mt-3 whitespace-nowrap text-[clamp(2.4rem,5vw,4rem)] font-black leading-none tracking-tight text-white">
                            {formatCurrency(data.ingresosTotales)}
                        </p>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-white/10 p-3">
                                <p className="text-slate-300">Pedidos</p>
                                <p className="mt-1 text-xl font-black">{formatNumber(data.totalPedidos)}</p>
                            </div>
                            <div className="rounded-2xl bg-white/10 p-3">
                                <p className="text-slate-300">Propinas</p>
                                <p className="mt-1 text-xl font-black">{formatCurrency(data.totalPropinas)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DateRangeFilter
                onFilter={setFilters}
                isExporting={exporting}
                onExportCSV={() => handleExport('csv')}
                onExportPDF={() => handleExport('pdf')}
            />

            {backendError && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm leading-6 text-orange-800">
                    <strong>No se pudieron cargar metricas reales:</strong> {backendError}
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
                <MetricCard
                    tone="emerald"
                    label="Ingresos totales"
                    value={formatCurrency(data.ingresosTotales)}
                    helper="Total facturado en el periodo seleccionado."
                />
                <MetricCard
                    label="Pedidos"
                    value={formatNumber(data.totalPedidos)}
                    helper="Ordenes procesadas en el rango actual."
                />
                <MetricCard
                    tone="blue"
                    label="Completados"
                    value={formatNumber(data.pedidosCompletados)}
                    helper={`${completionRate}% de los pedidos del rango fueron entregados.`}
                />
                <MetricCard
                    tone="amber"
                    label="Ticket promedio"
                    value={formatCurrency(data.ticketPromedio)}
                    helper="Promedio de venta por pedido completado."
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <SectionPanel title="Resumen financiero" subtitle="Una vista rapida del dinero que entro y del rango aplicado.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Total propinas</p>
                            <p className="mt-4 whitespace-nowrap text-3xl font-black text-slate-950">{formatCurrency(data.totalPropinas)}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">Propinas registradas en facturas del periodo.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Rango seleccionado</p>
                            <p className="mt-4 text-lg font-black leading-7 text-slate-950">{selectedRange}</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">Los datos y exportaciones usan este filtro.</p>
                        </div>
                    </div>
                </SectionPanel>

                <SectionPanel title="Platos mas vendidos" subtitle="Productos con mayor movimiento durante el periodo.">
                    {data.topPlatos.length > 0 ? (
                        <div className="space-y-4">
                            {data.topPlatos.map((plato, idx) => (
                                <div key={plato.id || idx} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-slate-950">{idx + 1}. {plato.nombre}</p>
                                            <p className="mt-1 text-sm text-slate-500">{formatNumber(plato.cantidad)} vendidos</p>
                                        </div>
                                        <p className="whitespace-nowrap text-xl font-black text-slate-950">{formatCurrency(plato.ingresos)}</p>
                                    </div>
                                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                                            style={{ width: `${Math.min(Math.max(plato.porcentaje || 0, 2), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
                            No hay datos de platos disponibles para este rango.
                        </p>
                    )}
                </SectionPanel>
            </div>

            <SectionPanel title="Ingresos por restaurante" subtitle="Comparativa de ingresos entre locales.">
                {data.ingresosPorRestaurante.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {data.ingresosPorRestaurante.map((item, idx) => {
                            const percentage = (Number(item.ingresos || 0) / Math.max(data.ingresosTotales, 1)) * 100;
                            return (
                                <div key={idx} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="break-words text-base font-black text-slate-950">{item.restaurante}</p>
                                            <p className="mt-2 text-sm text-slate-500">{formatCurrency(item.ingresos)}</p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-slate-950"
                                            style={{ width: `${Math.min(Math.max(percentage, 2), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
                        No hay ingresos por restaurante para mostrar.
                    </p>
                )}
            </SectionPanel>
        </div>
    );
};