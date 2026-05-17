import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { CheckCircle2, Clock, Package, XCircle, Truck, ChevronDown, ChevronUp, ArrowRight, ShoppingBag } from "lucide-react";
import deliveryImg from "../../../assets/images/delivery.png";

const filterOptions = [
    { label: "Todos", statuses: [] },
    { label: "Entregados", statuses: ["entregado"] },
    { label: "Pendientes", statuses: ["pendiente", "en preparacion", "listo para entrega", "en camino"] },
    { label: "Cancelados", statuses: ["cancelado"] },
];

const statusConfig = {
    entregado: {
        label: "Entregado",
        icon: CheckCircle2,
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    "en preparacion": {
        label: "En preparación",
        icon: Clock,
        pill: "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-500",
    },
    pendiente: {
        label: "Pendiente",
        icon: Package,
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
    },
    cancelado: {
        label: "Cancelado",
        icon: XCircle,
        pill: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
    },
    "listo para entrega": {
        label: "En camino",
        icon: Truck,
        pill: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    "en camino": {
        label: "En camino",
        icon: Truck,
        pill: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
};

const currency = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });
const cx = (...classes) => classes.filter(Boolean).join(" ");
const normalize = (value = "") =>
    String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
        : "Fecha no disponible";
const getOrderId = (order) => order?._id || order?.id;
const getDetailOrderId = (detail) => {
    const pedido = detail?.pedido;
    if (typeof pedido === "string") return pedido;
    return pedido?._id || pedido?.id;
};
const getItemName = (item) => {
    const plato = item?.plato;
    if (typeof plato === "string") return item.nombrePlato || "Plato";
    return item?.nombrePlato || plato?.nombrePlato || plato?.nombre || "Plato";
};

export const UserOrdersPage = () => {
    const { orders, loading, error, fetchOrders } = useOrderStore();
    const { detailOrders, loading: loadingDetails, fetchDetailOrders } = useDetailOrderStore();
    const [activeFilter, setActiveFilter] = useState("Todos");
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders().catch(() => { });
        fetchDetailOrders().catch(() => { });
    }, [fetchDetailOrders, fetchOrders]);

    const detailsByOrder = useMemo(() => {
        const map = new Map();
        for (const detail of detailOrders) {
            const orderId = getDetailOrderId(detail);
            if (!orderId) continue;
            if (!map.has(orderId)) map.set(orderId, []);
            map.get(orderId).push(detail);
        }
        return map;
    }, [detailOrders]);

    const groupedOrders = useMemo(() => {
        const sorted = [...orders].sort(
            (a, b) => new Date(b.fechaPedido || b.createdAt || 0) - new Date(a.fechaPedido || a.createdAt || 0)
        );
        
        const groups = [];
        for (const order of sorted) {
            const orderTime = new Date(order.fechaPedido || order.createdAt || 0).getTime();
            // Find an existing group where the time difference is less than 5000ms
            const matchingGroup = groups.find(group => {
                const groupTime = new Date(group.fechaPedido || group.createdAt || 0).getTime();
                return Math.abs(groupTime - orderTime) < 5000;
            });
            
            if (matchingGroup) {
                matchingGroup.subOrders.push(order);
                matchingGroup.totalPedido = (matchingGroup.totalPedido || 0) + (order.totalPedido || 0);
                matchingGroup.total = (matchingGroup.total || 0) + (order.total || 0);
                if (order.restaurante?.nombre && !matchingGroup.restaurantNames.includes(order.restaurante.nombre)) {
                    matchingGroup.restaurantNames.push(order.restaurante.nombre);
                }
            } else {
                groups.push({
                    ...order,
                    restaurantNames: order.restaurante?.nombre ? [order.restaurante.nombre] : [],
                    subOrders: [order]
                });
            }
        }
        return groups;
    }, [orders]);

    const visibleOrders = useMemo(() => {
        const filter = filterOptions.find((item) => item.label === activeFilter);
        if (!filter || filter.statuses.length === 0) return groupedOrders;
        return groupedOrders.filter((order) => {
            return order.subOrders.some(subOrder => 
                filter.statuses.includes(normalize(subOrder.estado || subOrder.estadoPedido))
            );
        });
    }, [activeFilter, groupedOrders]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-slate-950 mb-8">
                <div className="absolute inset-0">
                    <img
                        src={deliveryImg}
                        alt="Delivery"
                        className="h-full w-full object-contain object-right opacity-40 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
                </div>
                <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-orange-500 mb-4">Historial de Órdenes</p>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Mis <span className="text-orange-500">Pedidos</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                        Recibos recientes, estados de entrega y el detalle de tus platos favoritos.
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5">
                            <ShoppingBag size={16} className="text-orange-500" />
                            <span className="text-white font-bold text-sm">{groupedOrders.length} pedidos en total</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
                {/* Filter Tabs */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-2">
                        {filterOptions.map((filter) => (
                            <button
                                key={filter.label}
                                type="button"
                                onClick={() => setActiveFilter(filter.label)}
                                className={cx(
                                    "rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200",
                                    activeFilter === filter.label
                                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600 flex items-center gap-3">
                        <XCircle size={18} />
                        {error}
                    </div>
                )}

                {loading || loadingDetails ? (
                    <section className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-56 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </section>
                ) : visibleOrders.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                            <ShoppingBag size={36} className="text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Sin pedidos aún</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                            Cambia el filtro o explora restaurantes para crear tu próximo pedido favorito.
                        </p>
                        <Link
                            to="/home/restaurants"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                        >
                            Explorar Restaurantes
                            <ArrowRight size={16} strokeWidth={3} />
                        </Link>
                    </section>
                ) : (
                    <section className="space-y-5">
                        {visibleOrders.map((order, index) => {
                            const orderId = getOrderId(order);
                            const normalizedStatus = normalize(order.estado || order.estadoPedido || "pendiente");
                            const status = statusConfig[normalizedStatus] || statusConfig.pendiente;
                            const StatusIcon = status.icon;
                            const isExpanded = expandedOrderId === orderId;
                            
                            // Combine details of all sub-orders in the group
                            const orderDetails = [];
                            for (const subOrder of order.subOrders) {
                                const subOrderId = getOrderId(subOrder);
                                const subOrderDetails = detailsByOrder.get(subOrderId) || [];
                                orderDetails.push(...subOrderDetails);
                            }

                            const items = orderDetails.length
                                ? orderDetails
                                : order.subOrders.map(sub => ({
                                    nombrePlato: "Detalle no disponible",
                                    cantidad: 1,
                                    precioUnitario: sub.total ?? sub.totalPedido ?? 0
                                  }));

                            const visibleItems = isExpanded ? items : items.slice(0, 3);
                            const hiddenCount = items.length - 3;
                            
                            const restaurantName = order.restaurantNames && order.restaurantNames.length > 0
                                ? order.restaurantNames.join(", ")
                                : (order.restaurante?.nombre || "Restaurante");
                                
                            const orderNumber = order.numeroPedido
                                ? `#${order.numeroPedido}`
                                : `#${String(orderId || "").slice(-6).toUpperCase()}`;

                            return (
                                <article
                                    key={orderId}
                                    style={{ animation: "orderIn .4s ease-out both", animationDelay: `${index * 60}ms` }}
                                    className="group overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <style>{`
                                        @keyframes orderIn {
                                            from { opacity: 0; transform: translateY(16px); }
                                            to   { opacity: 1; transform: translateY(0); }
                                        }
                                    `}</style>

                                    {/* Card Header */}
                                    <div
                                        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 md:p-8 cursor-pointer"
                                        onClick={() => setExpandedOrderId((c) => (c === orderId ? null : orderId))}
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Color accent line */}
                                            <div className={cx("h-14 w-1.5 rounded-full flex-shrink-0", status.dot)} />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{restaurantName}</p>
                                                <h2 className="mt-1 text-xl font-black text-slate-900">{orderNumber}</h2>
                                                <p className="mt-0.5 text-xs font-medium text-slate-400">{formatDate(order.fechaPedido || order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className={cx("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold", status.pill)}>
                                                <StatusIcon size={14} className={normalizedStatus === "en preparacion" ? "animate-pulse" : ""} />
                                                {status.label}
                                            </span>
                                            <div className="text-slate-400">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="mx-6 md:mx-8 h-px bg-slate-100" />

                                    {/* Items */}
                                    <div className="p-6 md:p-8">
                                        <div
                                            className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                                            style={{ maxHeight: isExpanded ? "500px" : "130px" }}
                                        >
                                            <div className="space-y-3">
                                                {visibleItems.map((item, itemIndex) => (
                                                    <div key={`${orderId}-${itemIndex}`} className="flex items-center gap-3">
                                                        <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-orange-500 text-[11px] font-black text-white">
                                                            {itemIndex + 1}
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {getItemName(item)}
                                                            <span className="ml-2 text-xs font-bold text-slate-400">×{item.cantidad || 1}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                                {!isExpanded && hiddenCount > 0 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setExpandedOrderId(orderId); }}
                                                        className="ml-10 text-xs font-bold text-orange-500 hover:underline"
                                                    >
                                                        + {hiddenCount} más
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-slate-100">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total del pedido</p>
                                                <p className="text-2xl font-black text-slate-900 mt-1">
                                                    {currency.format(Number(order.total ?? order.totalPedido ?? 0))}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/home/orders/${orderId}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 active:scale-95"
                                            >
                                                Ver seguimiento
                                                <ArrowRight size={14} strokeWidth={3} />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
};

export default UserOrdersPage;
