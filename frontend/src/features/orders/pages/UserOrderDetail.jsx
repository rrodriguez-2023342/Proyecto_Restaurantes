import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bike, Clock3, CookingPot, House, MapPin, Phone, StickyNote, Receipt, ShieldCheck, XCircle } from "lucide-react";
import { getOrderById, getDetailOrdersByOrderId } from "../../../shared/api";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { DeliveryTruck } from "../components/DeliveryTruck";

const currency = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
});

const normalizeStatus = (status) =>
    String(status || "pendiente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/_/g, " ")
        .trim();

const normalizeOrderPayload = (rawOrder) => {
    if (!rawOrder) return null;

    const orderId = rawOrder._id || rawOrder.id;
    const status = rawOrder.estado || rawOrder.estadoPedido || "pendiente";
    const total = rawOrder.total ?? rawOrder.totalPedido ?? 0;

    return {
        ...rawOrder,
        id: orderId,
        _id: rawOrder._id || orderId,
        numeroPedido: rawOrder.numeroPedido || orderId?.slice(-6),
        estado: status,
        estadoPedido: rawOrder.estadoPedido || status,
        total,
        subtotal: rawOrder.subtotal ?? total,
        restaurante:
            typeof rawOrder.restaurante === "string"
                ? { id: rawOrder.restaurante, nombre: rawOrder.restaurante }
                : rawOrder.restaurante,
        fechaPedido: rawOrder.fechaPedido || rawOrder.createdAt,
    };
};

const getTrackingStep = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "entregado") return 3;
    if (normalizedStatus === "en camino" || normalizedStatus === "listo para entrega" || normalizedStatus === "listo") return 2;
    if (normalizedStatus === "en preparacion" || normalizedStatus === "confirmado") return 1;
    return 0;
};

export const UserOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, fetchOrders, updateOrder } = useOrderStore();
    const { detailOrders, fetchDetailOrdersByOrderId } = useDetailOrderStore();
    const [order, setOrder] = useState(null);
    const [localDetails, setLocalDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryPhone, setDeliveryPhone] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [savingDelivery, setSavingDelivery] = useState(false);
    const [confirmingDelivery, setConfirmingDelivery] = useState(false);

    useEffect(() => {
        const loadOrderDetail = async () => {
            try {
                setLoading(true);
                let foundOrder = orders.find((item) => (item._id || item.id) === id);

                if (!foundOrder) {
                    await fetchOrders();
                    foundOrder = useOrderStore.getState().orders.find((item) => (item._id || item.id) === id);
                }

                if (!foundOrder) {
                    const { data } = await getOrderById(id);
                    foundOrder = normalizeOrderPayload(data?.data || data?.pedido || data);
                }

                if (!foundOrder) {
                    showError("Pedido no encontrado");
                    navigate("/home/orders");
                    return;
                }

                setDeliveryAddress(foundOrder.direccionEntrega || "");
                setDeliveryPhone(foundOrder.telefono || "");
                setDeliveryNotes(foundOrder.notas || "");

                // Find all related orders (placed at almost the same time by the same user)
                const targetTime = new Date(foundOrder.fechaPedido || foundOrder.createdAt || 0).getTime();
                const allOrders = useOrderStore.getState().orders;
                let related = allOrders.filter(o => {
                    const oTime = new Date(o.fechaPedido || o.createdAt || 0).getTime();
                    return Math.abs(oTime - targetTime) < 5000;
                });

                if (related.length === 0) {
                    related = [foundOrder];
                }

                // Fetch detail orders for all related orders in parallel
                const detailsPromises = related.map(async (o) => {
                    try {
                        const { data } = await getDetailOrdersByOrderId(o._id || o.id);
                        return data?.data || data?.detallePedidos || data || [];
                    } catch (e) {
                        console.error("Error fetching detail for order:", o._id || o.id, e);
                        return [];
                    }
                });

                const detailsResults = await Promise.all(detailsPromises);
                // Normalize and flatten all detail items
                const allNormalizedDetails = detailsResults.flatMap((payload) => {
                    const details = Array.isArray(payload) ? payload : payload ? [payload] : [];
                    return details.flatMap((detail) => {
                        const detailId = detail.detallePedidoId || detail._id || detail.id;
                        const items = Array.isArray(detail.items) ? detail.items : [];
                        return items.map((item, index) => ({
                            ...item,
                            _id: `${detailId || "detail"}-${index}`,
                            detailOrderId: detailId,
                            pedido: detail.pedido,
                            cantidad: item.cantidad || 0,
                            precioUnitario: item.precio || item.precioUnitario || 0,
                            subtotal: item.subtotal || (item.cantidad || 0) * (item.precio || item.precioUnitario || 0),
                            plato: typeof item.plato === "string" ? { id: item.plato, nombre: item.plato } : item.plato,
                            nombrePlato: item.nombrePlato || item.plato?.nombre || item.plato?.nombrePlato || "N/A",
                        }));
                    });
                });

                // Consolidate order details into order state
                const consolidatedOrder = {
                    ...foundOrder,
                    subOrders: related,
                    total: related.reduce((sum, o) => sum + (o.total ?? o.totalPedido ?? 0), 0),
                    subtotal: related.reduce((sum, o) => sum + (o.subtotal ?? o.total ?? o.totalPedido ?? 0), 0),
                    restaurantNames: related
                        .map(o => o.restaurante?.nombre || "Restaurante")
                        .filter((v, i, self) => self.indexOf(v) === i),
                };

                setOrder(consolidatedOrder);
                setLocalDetails(allNormalizedDetails);
            } catch (err) {
                console.error("loadOrderDetail error:", err);
                showError("Error al cargar el pedido");
                navigate("/home/orders");
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetail();
    }, [fetchOrders, id, navigate, orders]);

    const trackingSteps = useMemo(() => {
        let currentStep = 0;
        if (order?.subOrders) {
            currentStep = Math.max(...order.subOrders.map(o => getTrackingStep(o.estado || o.estadoPedido)));
        } else {
            currentStep = getTrackingStep(order?.estado || order?.estadoPedido);
        }
        const orderDate = order?.fechaPedido || order?.createdAt;

        return [
            {
                key: "received",
                title: "Recibido",
                description: orderDate
                    ? `Pedido confirmado el ${new Date(orderDate).toLocaleDateString("es-ES")}`
                    : "Tu orden ya fue registrada por el restaurante.",
                icon: Clock3,
            },
            {
                key: "preparing",
                title: "Preparando",
                description: "La cocina ya está trabajando en tus platos.",
                icon: CookingPot,
            },
            {
                key: "delivery",
                title: "En camino",
                description: "Tu pedido salió del restaurante y va rumbo a tu dirección.",
                icon: Bike,
            },
            {
                key: "delivered",
                title: "Entregado",
                description: "Pedido finalizado y entregado con éxito.",
                icon: House,
            },
        ].map((step, index) => ({
            ...step,
            state: index < currentStep ? "completed" : index === currentStep ? "active" : "upcoming",
        }));
    }, [order]);

    const isCancelled = order?.subOrders
        ? order.subOrders.every(o => normalizeStatus(o.estado || o.estadoPedido) === "cancelado")
        : normalizeStatus(order?.estado || order?.estadoPedido) === "cancelado";

    const isDelivered = order?.subOrders
        ? order.subOrders.every(o => normalizeStatus(o.estado || o.estadoPedido) === "entregado")
        : normalizeStatus(order?.estado || order?.estadoPedido) === "entregado";

    const canUpdateDelivery = !isCancelled && !isDelivered;

    const canConfirmDelivery = order?.subOrders
        ? order.subOrders.some(o => ["en camino", "listo para entrega", "listo", "en preparacion"].includes(normalizeStatus(o.estado || o.estadoPedido)))
        : ["en camino", "listo para entrega", "listo", "en preparacion"].includes(normalizeStatus(order?.estado || order?.estadoPedido));

    const handleSaveDelivery = async () => {
        try {
            setSavingDelivery(true);
            const targets = order.subOrders && order.subOrders.length > 0 ? order.subOrders : [order];
            await Promise.all(
                targets.map(o =>
                    updateOrder(o._id || o.id, {
                        direccionEntrega: deliveryAddress,
                        telefono: deliveryPhone,
                        notes: deliveryNotes,
                    })
                )
            );
            showSuccess("Datos de entrega actualizados");
            setOrder((prev) => ({
                ...prev,
                direccionEntrega: deliveryAddress,
                telefono: deliveryPhone,
                notas: deliveryNotes,
                subOrders: prev.subOrders ? prev.subOrders.map(o => ({
                    ...o,
                    direccionEntrega: deliveryAddress,
                    telefono: deliveryPhone,
                    notas: deliveryNotes,
                })) : []
            }));
        } catch (err) {
            showError(err.response?.data?.message || "Error al actualizar datos de entrega");
        } finally {
            setSavingDelivery(false);
        }
    };

    const handleConfirmDelivery = async () => {
        if (!window.confirm("¿Confirmas que el pedido fue entregado? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setConfirmingDelivery(true);
            const targets = order.subOrders && order.subOrders.length > 0 ? order.subOrders : [order];
            await Promise.all(
                targets.map(o =>
                    updateOrder(o._id || o.id, {
                        estadoPedido: "Entregado",
                    })
                )
            );
            showSuccess("Pedido marcado como entregado");
            setOrder((prev) => ({
                ...prev,
                estado: "Entregado",
                estadoPedido: "Entregado",
                subOrders: prev.subOrders ? prev.subOrders.map(o => ({
                    ...o,
                    estado: "Entregado",
                    estadoPedido: "Entregado",
                })) : []
            }));
        } catch (err) {
            showError(err.response?.data?.message || "Error al confirmar entrega");
        } finally {
            setConfirmingDelivery(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando pedido...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-200 text-4xl mb-4">🍽️</div>
                    <p className="text-xl font-bold text-slate-900">Pedido no encontrado</p>
                    <button onClick={() => navigate("/home/orders")} className="mt-6 text-sm font-bold text-orange-500 hover:underline">Volver a mis pedidos</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Hero */}
            <div className="bg-slate-950 pt-10 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-950 to-slate-950" />
                <div className="relative mx-auto max-w-5xl">
                    <button
                        onClick={() => navigate("/home/orders")}
                        className="group mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-colors group-hover:bg-white/10">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                        </div>
                        Volver a pedidos
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-orange-500 mb-2">
                                {order.restaurantNames && order.restaurantNames.length > 0 
                                    ? order.restaurantNames.join(", ") 
                                    : (order.restaurante?.nombre || "Restaurante")}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Pedido <span className="text-orange-500">#{order.numeroPedido || id?.slice(-6)}</span>
                            </h1>
                            <p className="mt-3 text-sm font-medium text-slate-400">
                                Realizado el {new Date(order.fechaPedido || order.createdAt).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid gap-8 lg:grid-cols-12">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Tracking Section */}
                        <div className="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
                            {isCancelled ? (
                                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-bold text-rose-600 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <XCircle className="h-5 w-5 text-rose-700" />
                                    </div>
                                    Este pedido ha sido cancelado.
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8 flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                            <Bike className="h-6 w-6" strokeWidth={2} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Estado del Envío</h3>
                                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">Rastrea tu orden</p>
                                        </div>
                                    </div>

                                    {/* Animated Truck (only if active) */}
                                    {!isDelivered && (
                                        <div className="mb-10 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-center">
                                            <DeliveryTruck />
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="space-y-6 relative ml-4">
                                        <div className="absolute top-8 bottom-8 left-[1.125rem] w-0.5 bg-slate-100" />
                                        {trackingSteps.map((step, index) => {
                                            const Icon = step.icon;
                                            const isCompleted = step.state === "completed";
                                            const isActive = step.state === "active";

                                            return (
                                                <div key={step.key} className="relative flex gap-6">
                                                    <div
                                                        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                                                            isCompleted
                                                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                                : isActive
                                                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200 ring-4 ring-orange-50"
                                                                    : "bg-white border-2 border-slate-200 text-slate-300"
                                                        }`}
                                                    >
                                                        <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} strokeWidth={isCompleted || isActive ? 2.5 : 2} />
                                                    </div>
                                                    <div className="pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <p className={`text-base font-bold ${isActive ? "text-orange-500" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                                                                {step.title}
                                                            </p>
                                                            {isActive && (
                                                                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-600">
                                                                    Actual
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-sm font-medium text-slate-500">{step.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                    <Receipt className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Artículos</h3>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">{localDetails.length} items en tu pedido</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {localDetails.map((detail, idx) => (
                                    <div key={detail._id || detail.id || idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="grid h-10 w-10 place-items-center rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500">
                                                x{detail.cantidad}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{detail.plato?.nombre || detail.nombrePlato || "Plato desconocido"}</p>
                                                <p className="text-xs font-medium text-slate-500">{currency.format(detail.precioUnitario || 0)} c/u</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {currency.format(detail.subtotal || detail.cantidad * detail.precioUnitario || 0)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Summary */}
                        <div className="rounded-[2.5rem] bg-slate-950 p-8 md:p-10 text-white shadow-2xl">
                            <h3 className="mb-8 text-xl font-black tracking-tight">Resumen</h3>
                            
                            <div className="space-y-4 border-b border-white/10 pb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-bold text-white">{currency.format(order.subtotal || order.total || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Impuesto</span>
                                    <span className="text-sm font-bold text-white">{currency.format(order.impuesto || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Envío</span>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">GRATIS</span>
                                </div>
                            </div>
                            
                            <div className="pt-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pagado</p>
                                <p className="text-4xl font-black text-white tracking-tighter">
                                    {currency.format(order.total || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="rounded-[2rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Detalles de Entrega</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <MapPin size={12} /> Dirección
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        disabled={!canUpdateDelivery}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all resize-none disabled:opacity-60"
                                        placeholder="Tu dirección"
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <Phone size={12} /> Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={deliveryPhone}
                                        onChange={(e) => setDeliveryPhone(e.target.value)}
                                        disabled={!canUpdateDelivery}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all disabled:opacity-60"
                                        placeholder="Ej: 5555-5555"
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <StickyNote size={12} /> Notas (Opcional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        disabled={!canUpdateDelivery}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all resize-none disabled:opacity-60"
                                        placeholder="Instrucciones para el repartidor"
                                    />
                                </div>

                                {canUpdateDelivery && (
                                    <button
                                        onClick={handleSaveDelivery}
                                        disabled={savingDelivery}
                                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-[1.2rem] bg-slate-900 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {savingDelivery ? "Guardando..." : "Actualizar Datos"}
                                    </button>
                                )}

                                {canUpdateDelivery && canConfirmDelivery && (
                                    <button
                                        onClick={handleConfirmDelivery}
                                        disabled={confirmingDelivery}
                                        className="mt-2 w-full flex items-center justify-center gap-2 rounded-[1.2rem] bg-emerald-500 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <ShieldCheck size={16} />
                                        {confirmingDelivery ? "Confirmando..." : "Marcar Entregado"}
                                    </button>
                                )}

                                {isDelivered && (
                                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">¡Pedido Entregado!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetail;
