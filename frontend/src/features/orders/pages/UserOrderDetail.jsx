import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../../shared/components";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { OrderStatus } from "../components/OrderStatus.jsx";
import { showError } from "../../../shared/utils/toast";

export const UserOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders } = useOrderStore();
    const { detailOrders, fetchDetailOrdersByOrderId } = useDetailOrderStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrderDetail = async () => {
            try {
                setLoading(true);
                const foundOrder = orders.find((o) => (o._id || o.id) === id);
                if (!foundOrder) {
                    showError("Pedido no encontrado");
                    navigate("/home/orders");
                    return;
                }

                await fetchDetailOrdersByOrderId(id);
                setOrder(foundOrder);
            } catch (err) {
                showError("Error al cargar el pedido");
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetail();
    }, [id]);

    const relatedDetails = detailOrders.filter(
        (d) => d.pedido === id || d.pedido?._id === id || d.pedido?.id === id
    );

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
                <div className="mx-auto max-w-5xl text-center py-12">
                    <p className="text-slate-600">Pedido no encontrado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
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
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        ← Mis Pedidos
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información General */}
                        <Card title="Información del Pedido">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                        Restaurante
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                        {order.restaurante?.nombre || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                        Estado
                                    </p>
                                    <div className="mt-1">
                                        <OrderStatus status={order.estado || "pendiente"} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Dirección de Entrega */}
                        <Card title="Dirección de Entrega">
                            <p className="text-sm text-slate-700">
                                {order.direccionEntrega || "No especificada"}
                            </p>
                        </Card>

                        {/* Artículos del Pedido */}
                        <Card title="Artículos del Pedido">
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
                                                            ${(detail.precioUnitario || 0).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold text-slate-900">
                                                            ${(detail.subtotal || detail.cantidad * detail.precioUnitario || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No hay artículos en este pedido</p>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Resumen */}
                        <Card title="Resumen del Pedido">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="font-semibold text-slate-900">
                                        ${(order.subtotal || order.total || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Impuesto:</span>
                                    <span className="font-semibold text-slate-900">
                                        ${(order.impuesto || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-orange-600">${(order.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Estado Timeline */}
                        <Card title="Estado del Pedido">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                        <span className="text-xs font-bold text-orange-600">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Pedido Confirmado</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(order.fechaPedido || order.createdAt).toLocaleDateString("es-ES")}
                                        </p>
                                    </div>
                                </div>

                                {order.estado !== "pendiente" && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-600">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">En Preparación</p>
                                        </div>
                                    </div>
                                )}

                                {order.estado === "entregado" && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-600">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Entregado</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Notas */}
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
