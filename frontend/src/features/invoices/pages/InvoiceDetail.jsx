import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, downloadInvoicePDF } from "../../../shared/api/invoice";

export const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const demoInvoice = {
        _id: id || "INV-1001",
        fechaEmision: "2026-05-01T10:30:00Z",
        cliente: { nombre: "Juan Perez", nit: "123456-7", email: "juan@example.com" },
        restaurante: { nombre: "Kinal Grill & Steaks", direccion: "Zona 10, Guatemala" },
        items: [
            { id: 1, cantidad: 2, descripcion: "Puyazo Kinal Special", precioUnitario: 145.00, subtotal: 290.00 },
            { id: 2, cantidad: 2, descripcion: "Bebida Natural Grande", precioUnitario: 20.00, subtotal: 40.00 }
        ],
        subtotal: 330.00,
        impuestos: 39.60,
        total: 369.60,
        estado: "PAGADA",
        metodoPago: "TARJETA_CREDITO"
    };

     useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                const res = await getInvoiceById(id);
                const data = res.data?.data || res.data;
                if (data && Object.keys(data).length > 0) {
                    setInvoice(data);
                } else {
                    setInvoice(demoInvoice);
                }
            } catch {
                console.debug("Invoice API not available, using demo data");
                setInvoice(demoInvoice);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoice();
        }
    }, [id]);

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const res = await downloadInvoicePDF(id);
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Factura_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            console.debug("PDF download endpoint not available");
            alert("La descarga de PDF estará disponible cuando el backend esté configurado.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!invoice) return <div>Factura no encontrada</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-GT", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a facturas
                </button>
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                    {downloading ? "Descargando..." : "Descargar PDF"}
                </button>
            </div>

            {/* Invoice Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 sm:p-12">
                    {/* Top Section */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Factura</h2>
                            <p className="text-slate-500 font-medium mt-1">ID: {invoice._id}</p>
                            <p className="text-slate-500 font-medium mt-1">Fecha: {formatDate(invoice.fechaEmision || invoice.createdAt)}</p>
                            <div className="mt-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    invoice.estado === 'PAGADA' ? 'bg-green-100 text-green-700' : 
                                    invoice.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {invoice.estado}
                                </span>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
<h3 className="text-lg font-bold text-slate-900">{invoice.restaurante?.nombre || invoice.pedido?.restaurante?.nombre || "Kinal Eats"}</h3>
                            <p className="text-slate-500 mt-1">{invoice.restaurante?.direccion || "Ciudad"}</p>
                            <p className="text-slate-500 mt-1 font-medium">Método de pago: {invoice.metodoPago || "No especificado"}</p>
                        </div>
                    </div>
                    
                    <hr className="border-slate-100 mb-8" />

                    {/* Client Section */}
                    <div className="mb-12">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Facturado a:</h3>
                        <p className="text-lg font-bold text-slate-900">{invoice.cliente?.nombre || invoice.pedido?.usuario?.nombre || invoice.correoCliente || "Cliente"}</p>
                        <p className="text-slate-600">NIT: {invoice.cliente?.nit || "C/F"}</p>
                        <p className="text-slate-600">{invoice.cliente?.email || invoice.correoCliente || invoice.pedido?.usuario?.email || ""}</p>
                    </div>

                    {/* Items Table */}
                    <div className="mb-12 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-3 px-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Descripción</th>
                                    <th className="py-3 px-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-center">Cant.</th>
                                    <th className="py-3 px-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Precio Unit.</th>
                                    <th className="py-3 px-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items?.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="py-4 px-4 text-slate-900 font-medium">{item.descripcion}</td>
                                        <td className="py-4 px-4 text-slate-600 text-center">{item.cantidad}</td>
                                        <td className="py-4 px-4 text-slate-600 text-right">Q{Number(item.precioUnitario).toFixed(2)}</td>
                                        <td className="py-4 px-4 text-slate-900 font-bold text-right">Q{Number(item.subtotal || (item.cantidad * item.precioUnitario)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="flex flex-col md:flex-row justify-end">
                        <div className="w-full md:w-1/2 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>Q{Number(invoice.subtotal ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Impuestos</span>
                                <span>Q{Number(invoice.impuestos || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
                                <span className="text-xl font-bold text-slate-900">Total a Pagar</span>
                                <span className="text-2xl font-black text-orange-600">Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-200 text-center">
                    <p className="text-slate-500 text-sm font-medium">Gracias por su preferencia. Si tiene dudas sobre esta factura, por favor contáctenos.</p>
                </div>
            </div>
        </div>
    );
};
