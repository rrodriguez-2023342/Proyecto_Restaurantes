import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoiceById, downloadInvoicePDF, getInvoices } from "../../../shared/api/invoice";
import { getDetailOrdersByOrderId } from "../../../shared/api/detailOrder";
import { getRestaurantById } from "../../../shared/api/restaurant";
import { 
    Calendar, 
    Download, 
    Printer, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Receipt,
    Phone,
    User,
    Tag,
    Store
} from "lucide-react";
import logoImg from "../../../assets/images/logo1.png";

const TicketReceipt = ({ invoice, items = [], restaurantName = "" }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("es-GT", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const clientName = invoice.pedido?.cliente || invoice.cliente?.nombre || invoice.pedido?.usuario?.nombre || "Consumidor Final";
    const clientPhone = invoice.pedido?.telefono || "N/A";
    const displayRestaurant = restaurantName || invoice.restaurante?.nombre || invoice.pedido?.restaurante?.nombre || "KINAL EATS";
    
    // Items extraction logic
    const displayItems = items.length > 0 ? items : (invoice.items || []);

    return (
        <div className="w-full max-w-[24rem] mx-auto bg-white border-2 border-dashed border-slate-300 rounded-sm shadow-xl ticket-container overflow-hidden scale-90 sm:scale-100 transition-transform origin-top">
            {/* Logo & ID Header */}
            <div className="border-b-2 border-dashed border-slate-300 px-4 pt-10 pb-8 text-center bg-slate-50/30">
                <img 
                    src={logoImg} 
                    alt="KinalEats" 
                    className="h-12 mx-auto mb-4 opacity-90 grayscale contrast-125"
                />
                <h1 className="text-xl font-black text-slate-900 tracking-[0.4em]">TICKET</h1>
                <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase tracking-tighter">Copia Digital de Consumo</p>
            </div>

            {/* Header Section */}
            <div className="px-6 py-8 text-center border-b border-slate-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Store size={14} className="text-orange-500" />
                    <p className="font-black text-slate-950 text-base uppercase tracking-tight leading-none truncate max-w-[200px]">{displayRestaurant}</p>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">Guatemala, Centro América</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                    <Tag size={10} className="text-slate-300" />
                    <p className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-tighter">FACTURA: {invoice._id.substring(0, 12).toUpperCase()}</p>
                </div>
            </div>

            {/* Invoice Info */}
            <div className="px-6 py-4 border-b border-slate-100 font-mono text-[11px] space-y-2 bg-slate-50/20">
                <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 uppercase font-black whitespace-nowrap">Fecha</span>
                    <span className="text-slate-900 font-bold text-right">{formatDate(invoice.fechaEmision || invoice.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <span className="text-slate-400 uppercase font-black">Estado</span>
                    <span className="font-black uppercase text-orange-600 border border-orange-100 px-2 py-0.5 rounded text-[10px]">
                        {invoice.estado || "PAGADA"}
                    </span>
                </div>
            </div>

            {/* Client Info */}
            <div className="px-6 py-6 border-b border-slate-100 bg-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Datos del Cliente</p>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <User size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs text-slate-900 font-black uppercase leading-none mb-1 break-words">{clientName}</p>
                            <p className="font-mono text-[10px] text-slate-400 break-all">{invoice.correoCliente || invoice.pedido?.email || "sin-correo@kinaleats.com"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <p className="font-mono text-xs text-slate-700 font-bold tracking-tight">TEL: {clientPhone}</p>
                    </div>
                </div>
            </div>

            {/* Items Section */}
            <div className="px-6 py-8 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <div className="h-px w-8 bg-slate-200" />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Detalle de Compra</p>
                    <div className="h-px w-8 bg-slate-200" />
                </div>
                
                <div className="space-y-6">
                    {displayItems.length > 0 ? (
                        displayItems.map((item, index) => {
                            const desc = item.plato?.nombrePlato || item.nombrePlato || item.descripcion || "ARTÍCULO DE CONSUMO";
                            const qty = item.cantidad || 1;
                            const unitPrice = item.precio || item.precioUnitario || 0;
                            const subtotal = item.subtotal || (qty * unitPrice);
                            
                            return (
                                <div key={index} className="group min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <p className="font-mono text-[11px] font-black text-slate-900 uppercase leading-snug flex-1 break-words">
                                            {desc}
                                        </p>
                                        <p className="font-mono text-[11px] font-black text-slate-900 whitespace-nowrap shrink-0">
                                            Q{Number(subtotal).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="font-mono text-[10px] text-slate-400 italic">
                                        {qty} x Q{Number(unitPrice).toFixed(2)}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Receipt size={32} className="mx-auto text-slate-200 mb-4 stroke-1" />
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sin artículos</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Totals Section */}
            <div className="px-6 py-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal Bruto</span>
                    <span className="text-slate-900">Q{Number(invoice.subtotal || invoice.total || 0).toFixed(2)}</span>
                </div>
            </div>

            {/* Separator Line */}
            <div className="px-6 py-2">
                <div className="border-t-2 border-dashed border-slate-200"></div>
            </div>

            {/* Final Total */}
            <div className="px-6 py-10 text-center bg-white border-y border-slate-100">
                <p className="font-mono text-[11px] text-slate-900 mb-2 uppercase tracking-[0.3em] font-black">Total a Pagar</p>
                <div className="inline-block relative">
                    <p className="text-4xl font-black text-orange-600 font-mono tracking-tighter relative z-10">Q{Number(invoice.total || invoice.subtotal || 0).toFixed(2)}</p>
                    <div className="absolute -bottom-1 left-0 right-0 h-3 bg-orange-100/50 -rotate-1" />
                </div>
            </div>

            {/* Payment Method Footer */}
            <div className="px-6 py-6 text-center">
                <p className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Forma de Pago</p>
                <div className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-mono text-[10px] font-black uppercase tracking-widest">
                    {invoice.metodoPago || "TRANSACCIÓN ELECTRÓNICA"}
                </div>
            </div>

            {/* Final Message */}
            <div className="px-6 py-10 text-center border-t-2 border-dashed border-slate-200">
                <p className="font-mono uppercase tracking-[0.4em] font-black text-slate-950 text-xs mb-3">¡Gracias por Preferirnos!</p>
                <p className="font-mono text-[10px] text-slate-400 italic leading-relaxed">KinalEats - Experiencia Gastronómica Premium<br/>www.kinaleats.com</p>
            </div>

            {/* Security Mark */}
            <div className="px-4 py-4 text-center font-mono text-[8px] text-slate-200 tracking-[0.8em] select-none uppercase">
                Secure Transaction
            </div>
        </div>
    );
};

export const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [items, setItems] = useState([]);
    const [restaurantName, setRestaurantName] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchEverything = async () => {
            try {
                setLoading(true);
                // 1. Fetch target invoice
                const invRes = await getInvoiceById(id);
                const invData = invRes.data?.data || invRes.data;

                if (!invData) {
                    setInvoice(null);
                    return;
                }

                // 2. Fetch all user invoices to group them if they were created within 5 seconds
                let relatedInvoices = [invData];
                try {
                    const allInvsRes = await getInvoices();
                    const allInvs = allInvsRes.data?.data || allInvsRes.data || [];
                    const targetTime = new Date(invData.fechaEmision || invData.createdAt || 0).getTime();
                    const group = allInvs.filter(i => {
                        const iTime = new Date(i.fechaEmision || i.createdAt || 0).getTime();
                        return Math.abs(iTime - targetTime) < 5000;
                    });
                    if (group.length > 0) {
                        relatedInvoices = group;
                    }
                } catch (e) {
                    console.error("Failed to fetch all invoices for grouping", e);
                }

                // 3. Fetch all details for these invoices' orders
                const allItems = [];
                for (const inv of relatedInvoices) {
                    const orderId = inv.pedido?._id || inv.pedido?.id || inv.pedido;
                    if (orderId) {
                        try {
                            const detailsRes = await getDetailOrdersByOrderId(orderId);
                            const detailData = detailsRes.data?.data || detailsRes.data;
                            if (detailData?.items && Array.isArray(detailData.items)) {
                                allItems.push(...detailData.items);
                            } else if (Array.isArray(detailData)) {
                                allItems.push(...detailData);
                            }
                        } catch (e) {
                            console.error("Items fetch failed for order", orderId, e);
                        }
                    }
                }
                setItems(allItems);

                // 4. Fetch all restaurant names
                const restaurantNames = [];
                for (const inv of relatedInvoices) {
                    const restId = inv.restaurante?._id || inv.restaurante?.id || inv.restaurante || inv.pedido?.restaurante;
                    if (restId && typeof restId === "string") {
                        try {
                            const restRes = await getRestaurantById(restId);
                            const restData = restRes.data?.data || restRes.data;
                            if (restData?.nombre) {
                                restaurantNames.push(restData.nombre);
                            }
                        } catch (e) {
                            console.error("Restaurant fetch failed for", restId, e);
                        }
                    } else if (inv.restaurante?.nombre) {
                        restaurantNames.push(inv.restaurante.nombre);
                    }
                }

                const uniqueNames = restaurantNames.filter((v, i, self) => self.indexOf(v) === i);
                setRestaurantName(uniqueNames.join(", "));

                // 5. Consolidate and set invoice state
                const consolidatedInvoice = {
                    ...invData,
                    subtotal: relatedInvoices.reduce((sum, i) => sum + Number(i.subtotal || i.total || 0), 0),
                    total: relatedInvoices.reduce((sum, i) => sum + Number(i.total || i.subtotal || 0), 0),
                };
                setInvoice(consolidatedInvoice);
            } catch (err) {
                console.error("General fetch failed", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEverything();
    }, [id]);

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const res = await downloadInvoicePDF(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Factura_${id.substring(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            alert("Error al descargar PDF.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Receipt size={48} className="text-orange-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Sincronizando Ticket...</p>
                </div>
            </div>
        );
    }

    if (!invoice) return <div className="text-center py-40 font-black uppercase tracking-widest text-slate-400">Ticket no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 no-scrollbar">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="flex justify-between items-center no-print px-4">
                    <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-black transition-colors flex items-center gap-2">
                        <ArrowLeft size={14} /> Volver
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            <Printer size={18} className="text-slate-700" />
                        </button>
                        <button onClick={handleDownloadPDF} disabled={downloading} className="px-6 py-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50">
                            {downloading ? "..." : "Descargar"}
                        </button>
                    </div>
                </div>

                <div className="animate-in fade-in zoom-in-95 duration-700 ease-out">
                    <TicketReceipt 
                        invoice={invoice} 
                        items={items} 
                        restaurantName={restaurantName} 
                    />
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .min-h-screen { min-height: auto !important; padding: 0 !important; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default InvoiceDetail;
