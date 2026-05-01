import { useState, useEffect } from "react";
import { getDashboardStats, exportReportCSV, exportReportPDF } from "../../../shared/api/report";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { Card } from "../../../shared/components";

export const ReportsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [filters, setFilters] = useState({ startDate: null, endDate: null });

    const demoStats = {
        ingresosTotales: 125400.50,
        pedidosCompletados: 854,
        ticketPromedio: 146.80,
        topPlatos: [
            { id: 1, nombre: "Puyazo Kinal Special", cantidad: 145, ingresos: 21025.00, porcentaje: 85 },
            { id: 2, nombre: "Pizza Margarita Familiar", cantidad: 120, ingresos: 14400.00, porcentaje: 70 },
            { id: 3, nombre: "Hamburguesa Doble Queso", cantidad: 95, ingresos: 8075.00, porcentaje: 55 },
            { id: 4, nombre: "Ensalada César con Pollo", cantidad: 60, ingresos: 3900.00, porcentaje: 35 },
            { id: 5, nombre: "Bebida Natural Grande", cantidad: 210, ingresos: 4200.00, porcentaje: 90 }
        ],
        ingresosPorRestaurante: [
            { restaurante: "Kinal Grill & Steaks", ingresos: 45800 },
            { restaurante: "Pizza Kinal", ingresos: 32400 },
            { restaurante: "Tacos el Kinal", ingresos: 28900 },
            { restaurante: "Sushi Kinal", ingresos: 18300 }
        ]
    };

    const fetchStats = async (currentFilters) => {
        try {
            setLoading(true);
            const res = await getDashboardStats(currentFilters);
            const data = res.data?.data || res.data;
            if (data && Object.keys(data).length > 0) {
                setStats(data);
            } else {
                setStats(demoStats);
            }
        } catch {
            console.debug("Backend report endpoint not available, using demo data");
            setStats(demoStats);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(filters);
    }, [filters]);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
    };

    const handleExport = async (type) => {
        try {
            setExporting(true);
            const exportFn = type === 'csv' ? exportReportCSV : exportReportPDF;
            await exportFn(filters);
            // Note: PDF/CSV download not available in demo mode
        } catch {
            console.debug("Export endpoint not available");
            alert("La funcionalidad de exportación estará disponible cuando el backend esté configurado.");
        } finally {
            setExporting(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-slate-500 font-semibold animate-pulse">Cargando métricas del sistema...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reportes y Métricas</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Visualiza el rendimiento financiero y operativo de tus restaurantes.</p>
            </div>

            {/* Filters & Export */}
            <DateRangeFilter 
                onFilter={handleFilter} 
                isExporting={exporting}
                onExportCSV={() => handleExport('csv')}
                onExportPDF={() => handleExport('pdf')}
            />

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-20 h-20 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingresos Totales</p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900">Q{stats?.ingresosTotales.toLocaleString('es-GT', {minimumFractionDigits: 2})}</h3>
                    <div className="mt-2 flex items-center text-sm font-medium text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Datos actualizados
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pedidos Completados</p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900">{stats?.pedidosCompletados.toLocaleString()}</h3>
                    <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
                        Total de órdenes procesadas
                    </div>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-lg relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</p>
                    <h3 className="mt-2 text-3xl font-black text-white">Q{stats?.ticketPromedio.toLocaleString('es-GT', {minimumFractionDigits: 2})}</h3>
                    <div className="mt-2 flex items-center text-sm font-medium text-orange-400">
                        Por pedido completado
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Platos */}
                <Card className="rounded-[2rem] shadow-sm border-slate-200 overflow-hidden !p-0">
                    <div className="bg-slate-50 p-6 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Platos Más Vendidos</h3>
                        <p className="text-sm text-slate-500 mt-1">Ranking por volumen de ventas e ingresos generados.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {stats?.topPlatos.map((plato, idx) => (
                            <div key={plato.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{plato.nombre}</p>
                                            <p className="text-xs text-slate-500">{plato.cantidad} ventas</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">Q{plato.ingresos.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-amber-500' : 'bg-orange-400'}`}
                                        style={{ width: `${plato.porcentaje}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Ingresos por Restaurante */}
                <Card className="rounded-[2rem] shadow-sm border-slate-200 overflow-hidden !p-0">
                    <div className="bg-slate-50 p-6 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Ingresos por Restaurante</h3>
                        <p className="text-sm text-slate-500 mt-1">Distribución de ingresos entre las sucursales.</p>
                    </div>
                    <div className="p-6 space-y-5">
                        {stats?.ingresosPorRestaurante.map((item, idx) => (
                            <div key={idx} className="flex items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h4 className="text-sm font-bold text-slate-900">{item.restaurante}</h4>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                        <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${(item.ingresos / stats.ingresosTotales) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="ml-4 text-right">
                                    <p className="text-sm font-black text-slate-900">Q{item.ingresos.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 font-medium">{((item.ingresos / stats.ingresosTotales) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
