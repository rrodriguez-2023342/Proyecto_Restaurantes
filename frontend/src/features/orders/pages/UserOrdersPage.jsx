import { useEffect, useMemo, useState } from "react";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";

const filterOptions = [
    { label: "Todos", statuses: [] },
    { label: "Entregados", statuses: ["entregado"] },
    { label: "Pendientes", statuses: ["pendiente", "en preparacion", "en preparacion", "listo para entrega", "en camino"] },
    { label: "Cancelados", statuses: ["cancelado"] },
];

const statusStyles = {
    entregado: {
        label: "Entregado",
        icon: "OK",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    "en preparacion": {
        label: "En preparacion",
        icon: "...",
        className: "border-orange-200 bg-orange-50 text-orange-700",
    },
    pendiente: {
        label: "Pendiente",
        icon: "...",
        className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    cancelado: {
        label: "Cancelado",
        icon: "X",
        className: "border-red-200 bg-red-50 text-red-600",
    },
    "listo para entrega": {
        label: "En camino",
        icon: "->",
        className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    "en camino": {
        label: "En camino",
        icon: "->",
        className: "border-blue-200 bg-blue-50 text-blue-700",
    },
};

const currency = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
});

const cx = (...classes) => classes.filter(Boolean).join(" ");

const normalize = (value = "") =>
    String(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
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
    const {
        detailOrders,
        loading: loadingDetails,
        fetchDetailOrders,
    } = useDetailOrderStore();
    const [activeFilter, setActiveFilter] = useState("Todos");
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders().catch(() => {});
        fetchDetailOrders().catch(() => {});
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

    const visibleOrders = useMemo(() => {
        const sorted = [...orders].sort(
            (a, b) => new Date(b.fechaPedido || b.createdAt || 0) - new Date(a.fechaPedido || a.createdAt || 0)
        );
        const filter = filterOptions.find((item) => item.label === activeFilter);
        if (!filter || filter.statuses.length === 0) return sorted;
        return sorted.filter((order) => filter.statuses.includes(normalize(order.estado || order.estadoPedido)));
    }, [activeFilter, orders]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-5xl">
                <header className="mb-7 rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xl shadow-slate-200/70 sm:p-8">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Historial</p>
                    <div className="mx-auto mt-4 max-w-2xl">
                        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Mis Pedidos</h1>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                            Recibos recientes, estados de entrega y el detalle de tus platos favoritos.
                        </p>
                    </div>
                </header>

                <section className="mb-6 overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-2">
                        {filterOptions.map((filter) => (
                            <button
                                key={filter.label}
                                type="button"
                                onClick={() => setActiveFilter(filter.label)}
                                className={cx(
                                    "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition",
                                    activeFilter === filter.label
                                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                        : "border-slate-100 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </section>

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
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
                    <section className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center shadow-xl shadow-slate-200/60">
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange-50 text-4xl font-black text-orange-500">--</div>
                        <h2 className="mt-6 text-2xl font-black">No hay pedidos</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            Cambia el filtro o explora restaurantes para crear tu proximo recibo favorito.
                        </p>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {visibleOrders.map((order, index) => {
                            const orderId = getOrderId(order);
                            const normalizedStatus = normalize(order.estado || order.estadoPedido || "Pendiente");
                            const status = statusStyles[normalizedStatus] || statusStyles.pendiente;
                            const isExpanded = expandedOrderId === orderId;
                            const orderDetails = detailsByOrder.get(orderId) || [];
                            const items = orderDetails.length
                                ? orderDetails
                                : [{ nombrePlato: "Detalle no disponible", cantidad: 1, precioUnitario: order.total ?? order.totalPedido ?? 0 }];
                            const visibleItems = isExpanded ? items : items.slice(0, 3);
                            const hiddenCount = items.length - 3;
                            const restaurantName = order.restaurante?.nombre || "Restaurante";
                            const orderNumber = order.numeroPedido
                                ? `#${order.numeroPedido}`
                                : `#ORD-${String(orderId || "").slice(-6).toUpperCase()}`;

                            return (
                                <article
                                    key={orderId}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setExpandedOrderId((current) => (current === orderId ? null : orderId))}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            setExpandedOrderId((current) => (current === orderId ? null : orderId));
                                        }
                                    }}
                                    className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70 outline-none transition duration-300 hover:-translate-y-1 hover:border-orange-200 focus:border-orange-400"
                                    style={{ animation: "orderReceipt .45s ease-out both", animationDelay: `${index * 70}ms` }}
                                >
                                    <style>{`
                                        @keyframes orderReceipt {
                                            from { opacity: 0; transform: translateY(14px); }
                                            to { opacity: 1; transform: translateY(0); }
                                        }
                                    `}</style>
                                    <div className="border-b border-dashed border-slate-200 p-5 sm:p-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                                    {restaurantName}
                                                </p>
                                                <h2 className="mt-2 text-2xl font-black text-slate-950">{orderNumber}</h2>
                                                <p className="mt-1 text-sm font-semibold text-slate-500">{formatDate(order.fechaPedido || order.createdAt)}</p>
                                            </div>
                                            <span className={cx("inline-flex w-max items-center gap-2 rounded-full border px-3 py-2 text-xs font-black", status.className)}>
                                                <span className={normalizedStatus === "en preparacion" ? "animate-pulse" : ""}>{status.icon}</span>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <div
                                            className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                                            style={{ maxHeight: isExpanded ? "420px" : "142px" }}
                                        >
                                            <div className="space-y-3">
                                                {visibleItems.map((item, itemIndex) => (
                                                    <div key={`${orderId}-${getItemName(item)}-${itemIndex}`} className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-50 text-xs font-black text-orange-500">
                                                                {itemIndex + 1}
                                                            </span>
                                                            <span className="text-sm font-bold text-slate-700">
                                                                {getItemName(item)} - x{item.cantidad || 1}
                                                            </span>
                                                        </div>
                                                        <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                                                    </div>
                                                ))}
                                                {!isExpanded && hiddenCount > 0 && (
                                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-500">
                                                        + {hiddenCount} mas
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 border-t border-slate-100 pt-4 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total</p>
                                            <p className="mt-1 text-2xl font-black text-orange-500">
                                                {currency.format(Number(order.total ?? order.totalPedido ?? 0))}
                                            </p>
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
