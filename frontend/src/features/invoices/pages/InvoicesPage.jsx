import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInvoices } from "../../../shared/api/invoice";
import { useAuthStore } from "../../auth/store/authStore";

export const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
     const role = useAuthStore((state) => state.user?.role);
     const isAdmin = role === "ADMIN_ROLE" || role === "ADMIN_RESTAURANT_ROLE";

    const demoInvoices = [
        { _id: "INV-1001", fechaEmision: "2026-05-01T10:30:00Z", cliente: { nombre: "Juan Perez" }, total: 145.50, estado: "PAGADA" },
        { _id: "INV-1002", fechaEmision: "2026-05-01T11:15:00Z", cliente: { nombre: "Maria Garcia" }, total: 89.00, estado: "PENDIENTE" },
        { _id: "INV-1003", fechaEmision: "2026-05-02T14:20:00Z", cliente: { nombre: "Carlos Lopez" }, total: 210.25, estado: "PAGADA" },
        { _id: "INV-1004", fechaEmision: "2026-05-02T16:45:00Z", cliente: { nombre: "Ana Martinez" }, total: 45.00, estado: "ANULADA" },
    ];

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await getInvoices();
            const data = res.data?.data || res.data || [];
            setInvoices(data);
        } catch {
            console.debug("Invoices API not available, using demo data");
            setInvoices(demoInvoices);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(inv => {
        const clienteNombre = inv.cliente?.nombre || inv.pedido?.usuario?.nombre || inv.correoCliente || "";
        return (
            String(inv._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            clienteNombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const getStatusBadge = (statusObj) => {
        const status = (statusObj?.estado || statusObj?.pedido?.estadoPedido || "PENDIENTE").toUpperCase();
        
        switch (status) {
            case "ENTREGADO":
            case "PAGADA":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{status}</span>;
            case "PENDIENTE":
            case "EN PREPARACIÓN":
            case "LISTO PARA ENTREGA":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{status}</span>;
            case "CANCELADO":
            case "ANULADA":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{status}</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
        }
    };

    const formatDate = (dateString) => {
        const date = dateString ? new Date(dateString) : null;
        if (!date || Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("es-GT", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 md:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Facturas</h1>
                    <p className="mt-2 text-slate-600 font-medium">
                        {isAdmin ? "Gestiona y visualiza todas las facturas generadas en la plataforma." : "Historial de tus facturas y consumos."}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por ID o cliente..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-slate-500 font-medium">
                    Mostrando <span className="font-bold text-slate-900">{filteredInvoices.length}</span> facturas
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No hay facturas</h3>
                        <p className="mt-1 text-sm text-slate-500">No se encontraron facturas con los criterios de búsqueda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Factura</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    {isAdmin && <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>}
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {invoice._id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDate(invoice.fechaEmision || invoice.createdAt)}
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                                {invoice.cliente?.nombre || invoice.pedido?.usuario?.nombre || invoice.correoCliente || "N/A"}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            Q{Number(invoice.total ?? invoice.totalPedido ?? invoice.subtotal ?? 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invoice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link 
                                                to={isAdmin ? `/admin/invoices/${invoice._id}` : `/home/invoices/${invoice._id}`}
                                                className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                            >
                                                Ver detalle
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
