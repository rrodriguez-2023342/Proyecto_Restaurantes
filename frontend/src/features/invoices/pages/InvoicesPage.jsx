import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getInvoices } from "../../../shared/api/invoice";
import { useAuthStore } from "../../auth/store/authStore";
import { 
    Search, 
    Calendar as CalendarIcon, 
    Receipt,
    ArrowUpRight,
    SearchX,
    X
} from "lucide-react";
import invoiceHero from "../../../assets/images/comida10.png";

const cx = (...classes) => classes.filter(Boolean).join(" ");

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
        fetchInvoices();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const clienteNombre = inv.cliente?.nombre || inv.pedido?.usuario?.nombre || inv.correoCliente || "";
            const searchMatch =
                String(inv._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                clienteNombre.toLowerCase().includes(searchTerm.toLowerCase());

            // Date filtering logic
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

    const formatDate = (dateString) => {
        const date = dateString ? new Date(dateString) : null;
        if (!date || Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("es-GT", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

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
                {/* Search & Date Filter */}
                <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por ID o restaurante..."
                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="relative flex items-center flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <CalendarIcon size={16} />
                            </div>
                            <input 
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full lg:w-48 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
                            />
                            {dateFilter && (
                                <button 
                                    onClick={() => setDateFilter("")}
                                    className="absolute right-3 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="hidden sm:block h-10 w-[1px] bg-slate-200 mx-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Total: <span className="text-slate-900">{filteredInvoices.length}</span>
                        </p>
                    </div>
                </div>

                {/* List Container */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-lg shadow-orange-500/20"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cargando facturas...</p>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                                <SearchX size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">No se encontraron facturas</h3>
                            <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
                                {dateFilter ? `No hay registros para la fecha ${new Date(dateFilter).toLocaleDateString()}.` : "Prueba ajustando tus criterios de búsqueda."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto no-scrollbar">
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
                                        {filteredInvoices.map((invoice, index) => (
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
                                                        to={isAdmin ? `/admin/invoices/${invoice._id}` : `/home/invoices/${invoice._id}`}
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
                                {filteredInvoices.map((invoice) => (
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
                                                to={isAdmin ? `/admin/invoices/${invoice._id}` : `/home/invoices/${invoice._id}`}
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
};

export default InvoicesPage;
