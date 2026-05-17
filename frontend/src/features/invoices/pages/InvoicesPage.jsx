import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInvoices } from "../../../shared/api/invoice";
import { useAuthStore } from "../../auth/store/authStore";
import { adminTheme } from "../../../constants/theme";
import {
    ArrowUpRight,
    Calendar as CalendarIcon,
    Receipt,
    Search,
    SearchX,
    X,
} from "lucide-react";
import invoiceHero from "../../../assets/images/comida10.png";


export const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const role = useAuthStore((state) => state.user?.role);
    const isAdmin = role === "ADMIN_ROLE" || role === "ADMIN_RESTAURANT_ROLE";

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await getInvoices();
            const data = res.data?.data || res.data || [];
            setInvoices(data);
        } catch {
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            fetchInvoices();
        });
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const clienteNombre = inv.cliente?.nombre || inv.pedido?.usuario?.nombre || inv.correoCliente || "";
            const normalizedSearch = searchTerm.toLowerCase();
            const searchMatch =
                String(inv._id).toLowerCase().includes(normalizedSearch) ||
                clienteNombre.toLowerCase().includes(normalizedSearch);

            let dateMatch = true;
            if (dateFilter) {
                const invoiceDate = new Date(inv.fechaEmision || inv.createdAt);
                const selectedDate = new Date(dateFilter);

                dateMatch =
                    invoiceDate.getUTCFullYear() === selectedDate.getUTCFullYear() &&
                    invoiceDate.getUTCMonth() === selectedDate.getUTCMonth() &&
                    invoiceDate.getUTCDate() === selectedDate.getUTCDate();
            }

            return searchMatch && dateMatch;
        });
    }, [invoices, searchTerm, dateFilter]);

    const totals = useMemo(() => {
        const amount = filteredInvoices.reduce(
            (acc, invoice) => acc + Number(invoice.total ?? invoice.subtotal ?? 0),
            0
        );
        return {
            count: filteredInvoices.length,
            amount,
            globalCount: invoices.length,
        };
    }, [filteredInvoices, invoices.length]);

    const formatDate = (dateString) => {
        const date = dateString ? new Date(dateString) : null;
        if (!date || Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("es-GT", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDetailPath = (invoiceId) => (
        isAdmin ? `/admin/invoices/${invoiceId}` : `/home/invoices/${invoiceId}`
    );

    const groupedInvoices = useMemo(() => {
        if (isAdmin) return filteredInvoices;
        
        const groups = [];
        for (const inv of filteredInvoices) {
            const invTime = new Date(inv.fechaEmision || inv.createdAt || 0).getTime();
            const matchingGroup = groups.find(group => {
                const groupTime = new Date(group.fechaEmision || group.createdAt || 0).getTime();
                return Math.abs(groupTime - invTime) < 5000;
            });
            
            if (matchingGroup) {
                matchingGroup.subInvoices.push(inv);
                matchingGroup.total = (matchingGroup.total || 0) + Number(inv.total ?? inv.subtotal ?? 0);
            } else {
                groups.push({
                    ...inv,
                    subInvoices: [inv]
                });
            }
        }
        return groups;
    }, [filteredInvoices, isAdmin]);

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50">
                {/* Hero Banner */}
                <div className="relative overflow-hidden bg-slate-950 mb-8">
                    <div className="absolute inset-0">
                        <img
                            src={invoiceHero}
                            alt="Invoices"
                            className="h-full w-full object-cover object-center opacity-30 mix-blend-multiply"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
                    </div>
                    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-orange-500 mb-4">Administración Fiscal</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Mis <span className="text-orange-500">Facturas</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                            Gestiona tus comprobantes de pago, historial de consumos y detalles de facturación de forma segura.
                        </p>
                    </div>
                </div>

                <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
                    {/* Search & Filter Bar */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 grid gap-4 md:grid-cols-[1fr_16rem] items-end">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Búsqueda</label>
                            <div className="relative mt-2">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por ID de factura..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha de Emisión</label>
                            <div className="relative mt-2">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="date"
                                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all appearance-none"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                                {dateFilter && (
                                    <button 
                                        onClick={() => setDateFilter("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Invoices List Container */}
                    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-20">
                                <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Cargando Facturas...</p>
                            </div>
                        ) : groupedInvoices.length === 0 ? (
                            <div className="flex flex-col items-center py-20 px-6 text-center">
                                <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-6">
                                    <SearchX size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No se encontraron facturas</h3>
                                <p className="text-slate-400 text-sm font-medium mt-2 max-w-xs mx-auto">
                                    {dateFilter ? "No hay registros para la fecha seleccionada." : "Prueba buscando con otro término."}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Comprobante</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha de Emisión</th>
                                                {isAdmin && <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cliente</th>}
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monto Total</th>
                                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {groupedInvoices.map((invoice) => (
                                                <tr 
                                                    key={invoice._id} 
                                                    className="group hover:bg-slate-50/80 transition-all duration-300"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                                <Receipt size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 font-mono tracking-tighter">#{invoice._id.substring(0, 10).toUpperCase()}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Factura Electrónica</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <CalendarIcon size={14} className="text-slate-400" />
                                                            <p className="text-sm font-semibold">{formatDate(invoice.fechaEmision || invoice.createdAt)}</p>
                                                        </div>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-bold text-slate-900">
                                                                {invoice.cliente?.nombre || invoice.pedido?.cliente || invoice.correoCliente || "Usuario KinalEats"}
                                                            </p>
                                                        </td>
                                                    )}
                                                    <td className="px-8 py-6">
                                                        <p className="text-lg font-black text-slate-900 tracking-tight">
                                                            Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}
                                                        </p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <Link 
                                                            to={getDetailPath(invoice._id)}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 group-hover:-translate-x-2"
                                                        >
                                                            Detalles
                                                            <ArrowUpRight size={14} strokeWidth={3} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-slate-100">
                                    {groupedInvoices.map((invoice) => (
                                        <div key={invoice._id} className="p-6 space-y-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                                        <Receipt size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 font-mono tracking-tighter">#{invoice._id.substring(0, 10).toUpperCase()}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Electrónica</p>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-black text-slate-900 tracking-tight">
                                                    Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <CalendarIcon size={12} />
                                                    <p className="text-[10px] font-bold">{formatDate(invoice.fechaEmision || invoice.createdAt)}</p>
                                                </div>
                                                <Link 
                                                    to={getDetailPath(invoice._id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all"
                                                >
                                                    Ver Detalle
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="admin-kicker">Administracion fiscal</p>
                        <h1 className={adminTheme.pageTitle}>Facturas</h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Consulta comprobantes, fechas de emision, clientes y montos facturados.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[30rem]">
                        <MetricCard label="Mostradas" value={totals.count} className="bg-slate-950 text-amber-400" />
                        <MetricCard label="Total" value={totals.globalCount} className="bg-slate-50 text-slate-900" />
                        <MetricCard label="Monto" value={`Q${totals.amount.toFixed(2)}`} className="bg-amber-50 text-amber-800" />
                    </div>
                </div>
            </section>

            <section className="admin-surface rounded-2xl p-6">
                <div className="grid gap-4 lg:grid-cols-[1fr_16rem] lg:items-end">
                    <div>
                        <label className={adminTheme.label}>Busqueda</label>
                        <div className="relative mt-2">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por ID o cliente..."
                                className={`w-full pl-11 ${adminTheme.input}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={adminTheme.label}>Fecha</label>
                        <div className="relative mt-2">
                            <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className={`w-full pl-11 pr-10 ${adminTheme.input}`}
                            />
                            {dateFilter && (
                                <button
                                    type="button"
                                    onClick={() => setDateFilter("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="admin-card overflow-hidden rounded-2xl bg-white">
                <div className="admin-panel-heading border-b border-slate-900 p-6">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.28em] !text-white">Comprobantes registrados</h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cargando facturas...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="flex flex-col items-center p-20 text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                            <SearchX size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">No se encontraron facturas</h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-slate-400">
                            {dateFilter ? `No hay registros para la fecha seleccionada.` : "Prueba ajustando tus criterios de busqueda."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950">
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Comprobante</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Fecha</th>
                                        {isAdmin && <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Cliente</th>}
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Monto</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice._id} className="border-b border-slate-100 transition hover:bg-amber-50/60">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-lg shadow-slate-900/10">
                                                        <Receipt size={19} />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs font-black tracking-tight text-slate-900">#{invoice._id.substring(0, 10).toUpperCase()}</p>
                                                        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Factura electronica</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                    <CalendarIcon size={14} className="text-amber-600" />
                                                    {formatDate(invoice.fechaEmision || invoice.createdAt)}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {invoice.cliente?.nombre || invoice.pedido?.cliente || invoice.correoCliente || "Usuario KinalEats"}
                                                    </p>
                                                </td>
                                            )}
                                            <td className="px-6 py-5">
                                                <p className="text-lg font-black tracking-tight text-slate-900">
                                                    Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    to={getDetailPath(invoice._id)}
                                                    className={`${adminTheme.primaryButton} gap-2`}
                                                >
                                                    Detalles
                                                    <ArrowUpRight size={14} strokeWidth={3} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 md:hidden">
                            {filteredInvoices.map((invoice) => (
                                <article key={invoice._id} className="space-y-4 p-6 transition hover:bg-amber-50/60">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
                                                <Receipt size={18} />
                                            </div>
                                            <div>
                                                <p className="font-mono text-xs font-black tracking-tight text-slate-900">#{invoice._id.substring(0, 10).toUpperCase()}</p>
                                                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Electronica</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black tracking-tight text-slate-900">
                                            Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <CalendarIcon size={13} />
                                            <p className="text-[10px] font-bold">{formatDate(invoice.fechaEmision || invoice.createdAt)}</p>
                                        </div>
                                        <Link to={getDetailPath(invoice._id)} className={`${adminTheme.primaryButton} px-4 py-2 text-[9px]`}>
                                            Ver detalle
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

const MetricCard = ({ label, value, className }) => (
    <div className={`rounded-2xl border border-slate-200 p-4 ${className}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
        <p className="mt-2 truncate text-2xl font-black">{value}</p>
    </div>
);

export default InvoicesPage;
