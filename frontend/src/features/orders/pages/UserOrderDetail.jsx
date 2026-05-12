import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bike, Clock3, CookingPot, House } from "lucide-react";
import { Card } from "../../../shared/components";
import { getOrderById } from "../../../shared/api";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { OrderStatus } from "../components/OrderStatus.jsx";
import { showError } from "../../../shared/utils/toast";

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
    const { orders, fetchOrders } = useOrderStore();
    const { detailOrders, fetchDetailOrdersByOrderId } = useDetailOrderStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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

                await fetchDetailOrdersByOrderId(id);
                setOrder(foundOrder);
            } catch {
                showError("Error al cargar el pedido");
                navigate("/home/orders");
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetail();
    }, [fetchDetailOrdersByOrderId, fetchOrders, id, navigate, orders]);

    const relatedDetails = detailOrders.filter(
        (detail) => detail.pedido === id || detail.pedido?._id === id || detail.pedido?.id === id
    );

    const trackingSteps = useMemo(() => {
        const currentStep = getTrackingStep(order?.estado || order?.estadoPedido);
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
                description: "La cocina ya esta trabajando en tus platos.",
                icon: CookingPot,
            },
            {
                key: "delivery",
                title: "En camino",
                description: "Tu pedido salio del restaurante y va rumbo a tu direccion.",
                icon: Bike,
            },
            {
                key: "delivered",
                title: "Entregado",
                description: "Pedido finalizado y entregado con exito.",
                icon: House,
            },
        ].map((step, index) => ({
            ...step,
            state: index < currentStep ? "completed" : index === currentStep ? "active" : "upcoming",
        }));
    }, [order]);

    const isCancelled = normalizeStatus(order?.estado || order?.estadoPedido) === "cancelado";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-5xl py-12 text-center">
                    <p className="text-slate-600">Pedido no encontrado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Pedido #{order.numeroPedido || id?.slice(-6)}
                        </h1>
                        <p className="mt-1 text-slate-600">
                            {new Date(order.fechaPedido || order.createdAt).toLocaleDateString("es-ES")}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/home/orders")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Mis Pedidos
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card title="Informacion del Pedido">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Restaurante
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {order.restaurante?.nombre || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Estado
                                    </p>
                                    <div className="mt-1">
                                        <OrderStatus status={order.estado || "pendiente"} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Direccion de Entrega">
                            <p className="text-sm text-slate-700">
                                {order.direccionEntrega || "No especificada"}
                            </p>
                        </Card>

                        <Card title="Articulos del Pedido">
                            {relatedDetails.length ? (
                                <div className="space-y-2">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                                                        Plato
                                                    </th>
                                                    <th className="px-3 py-2 text-center font-semibold text-slate-700">
                                                        Cantidad
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                                        Precio Unit.
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-semibold text-slate-700">
                                                        Subtotal
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {relatedDetails.map((detail) => (
                                                    <tr key={detail._id || detail.id}>
                                                        <td className="px-3 py-2 text-slate-900">
                                                            {detail.plato?.nombre ||
                                                                detail.nombrePlato ||
                                                                "Plato desconocido"}
                                                        </td>
                                                        <td className="px-3 py-2 text-center text-slate-900">
                                                            {detail.cantidad}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-slate-900">
                                                            {currency.format(detail.precioUnitario || 0)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold text-slate-900">
                                                            {currency.format(detail.subtotal || detail.cantidad * detail.precioUnitario || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No hay articulos en este pedido</p>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Resumen del Pedido">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="font-semibold text-slate-900">
                                        {currency.format(order.subtotal || order.total || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Impuesto:</span>
                                    <span className="font-semibold text-slate-900">
                                        {currency.format(order.impuesto || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-orange-600">{currency.format(order.total || 0)}</span>
                                </div>
                            </div>
                        </Card>

                        <Card title="Estado del Pedido">
                            <div className="space-y-5">
                                {isCancelled && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                        Este pedido fue cancelado. El seguimiento se detuvo en la ultima fase registrada.
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {trackingSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isCompleted = step.state === "completed";
                                        const isActive = step.state === "active";

                                        return (
                                            <div key={step.key} className="relative flex gap-4">
                                                {index < trackingSteps.length - 1 && (
                                                    <span
                                                        className={`absolute left-[1.18rem] top-12 h-[calc(100%-1.2rem)] w-px ${
                                                            isCompleted || isActive ? "bg-orange-300" : "bg-slate-200"
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 ${
                                                        isCompleted
                                                            ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                                            : isActive
                                                                ? "border-orange-200 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
                                                                : "border-slate-200 bg-slate-50 text-slate-400"
                                                    }`}
                                                >
                                                    <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                                                </div>
                                                <div className="pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-900">{step.title}</p>
                                                        {isActive && (
                                                            <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                                                                Actual
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>

                        {order.notas && (
                            <Card title="Notas">
                                <div className="text-sm text-slate-600">
                                    {order.notas}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
