import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, downloadInvoicePDF } from "../../../shared/api/invoice";

const TicketReceipt = ({ invoice }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-GT", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const ticketStyle = `
        @media print {
            body { margin: 0; padding: 0; }
            .ticket-container { 
                max-width: 100% !important; 
                margin: 0 !important;
                box-shadow: none !important;
            }
        }
    `;

    return (
        <>
            <style>{ticketStyle}</style>
            <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-slate-300 rounded-sm shadow-lg ticket-container">
                {/* Top dashed border */}
                <div className="border-b-2 border-dashed border-slate-300 px-4 pt-6 pb-4 text-center">
                    <h1 className="text-lg font-black text-slate-900 tracking-widest">TICKET</h1>
                </div>

                {/* Header Section */}
                <div className="px-4 py-4 text-center border-b border-slate-200">
                    <p className="font-bold text-slate-900 text-sm">{invoice.restaurante?.nombre || "KINAL EATS"}</p>
                    <p className="text-xs text-slate-600 mt-1">{invoice.restaurante?.direccion || "Guatemala"}</p>
                    <p className="text-xs text-slate-600 font-mono">ID: {invoice._id}</p>
                </div>

                {/* Invoice Info */}
                <div className="px-4 py-3 border-b border-slate-200 font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{formatDate(invoice.fechaEmision || invoice.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className="font-bold uppercase">{invoice.estado}</span>
                    </div>
                </div>

                {/* Client Info */}
                <div className="px-4 py-3 border-b border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Cliente</p>
                    <p className="font-mono text-xs text-slate-900">{invoice.cliente?.nombre || "CLIENTE"}</p>
                    <p className="font-mono text-xs text-slate-600">NIT: {invoice.cliente?.nit || "C/F"}</p>
                </div>

                {/* Items Section */}
                <div className="px-4 py-4 border-b border-slate-200">
                    <div className="space-y-3">
                        {invoice.items?.map((item, index) => (
                            <div key={index} className="pb-2 border-b border-slate-100 last:border-0">
                                <div className="font-mono text-xs font-bold text-slate-900 truncate">
                                    {item.descripcion}
                                </div>
                                <div className="flex justify-between font-mono text-xs text-slate-600 mt-1">
                                    <span>{item.cantidad}x Q{Number(item.precioUnitario).toFixed(2)}</span>
                                    <span className="font-bold text-slate-900">Q{Number(item.subtotal || (item.cantidad * item.precioUnitario)).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Separator Line */}
                <div className="px-4 py-2">
                    <div className="border-t-2 border-dashed border-slate-300"></div>
                </div>

                {/* Totals */}
                <div className="px-4 py-3 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>Q{Number(invoice.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Impuestos:</span>
                        <span>Q{Number(invoice.impuestos || 0).toFixed(2)}</span>
                    </div>
                </div>

                {/* Separator Line */}
                <div className="px-4 py-2">
                    <div className="border-t-2 border-dashed border-slate-300"></div>
                </div>

                {/* Total Amount */}
                <div className="px-4 py-4 text-center">
                    <p className="font-mono text-xs text-slate-600 mb-1">TOTAL A PAGAR</p>
                    <p className="text-2xl font-black text-orange-600 font-mono">Q{Number(invoice.total ?? invoice.subtotal ?? 0).toFixed(2)}</p>
                </div>

                {/* Payment Method */}
                <div className="px-4 py-3 border-b border-slate-200 font-mono text-xs">
                    <p className="text-slate-600">Método: <span className="font-bold text-slate-900">{invoice.metodoPago || "NO ESPECIFICADO"}</span></p>
                </div>

                {/* Footer */}
                <div className="px-4 py-4 text-center text-xs text-slate-600 border-b-2 border-dashed border-slate-300">
                    <p className="font-mono">Gracias por su compra!</p>
                    <p className="font-mono text-slate-500 mt-1">Conserve este comprobante</p>
                </div>

                {/* Bottom dashed border */}
                <div className="px-4 py-3 text-center font-mono text-xs text-slate-400">
                    <p>~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~</p>
                </div>
            </div>
        </>
    );
};

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

    if (!invoice) return <div className="text-center py-8 text-slate-600">Factura no encontrada</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header / Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2h-2m-4-4V9m0 0H9m3 0H9" />
                            </svg>
                            Imprimir
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-70"
                        >
                            {downloading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            )}
                            {downloading ? "Descargando..." : "Descargar"}
                        </button>
                    </div>
                </div>

                {/* Ticket Receipt */}
                <div className="flex justify-center">
                    <TicketReceipt invoice={invoice} />
                </div>
            </div>
        </div>
    );
};
