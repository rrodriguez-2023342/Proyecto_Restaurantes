import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, FormField } from "../../../shared/components";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { getDetailOrdersByOrderId } from "../../../shared/api/detailOrder";
import { Cart } from "../components/Cart.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast";

export const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, updateOrder } = useOrderStore();
    const { detailOrders, fetchDetailOrdersByOrderId, updateDetailOrder } = useDetailOrderStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        register,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        const loadOrderDetail = async () => {
            try {
                setLoading(true);
                const foundOrder = orders.find((o) => (o._id || o.id) === id);
                if (!foundOrder) {
                    showError("Pedido no encontrado");
                    navigate("/admin/orders");
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

    const handleStatusChange = async (newStatus) => {
        try {
            setSaving(true);
            await updateOrder(id, { estadoPedido: newStatus });
            setOrder({ ...order, estado: newStatus });
            showSuccess("Estado actualizado correctamente");
        } catch (err) {
            showError("No se pudo actualizar el estado");
        } finally {
            setSaving(false);
        }
    };

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
                            Detalle del Pedido #{order.numeroPedido || id?.slice(-6)}
                        </h1>
                        <p className="mt-1 text-slate-600">
                            {new Date(order.fechaPedido || order.createdAt).toLocaleDateString("es-ES")}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        ← Volver
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Información General */}
                        <Card title="Información General">
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
                                        Cliente
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                        {order.usuario?.nombre || order.usuario?.id || order.cliente || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                        Email
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                        {order.usuario?.email || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">
                                        Teléfono
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900 mt-1">
                                        {order.usuario?.telefono || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Dirección de Entrega */}
                        <Card title="Dirección de Entrega">
                            <p className="text-sm text-slate-700">
                                {order.direccionEntrega || "No especificada"}
                            </p>
                        </Card>

                        {/* Detalles del Pedido */}
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
                        <Card title="Resumen">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Subtotal:</span>
                                    <span className="font-semibold text-slate-900">
                                        ${(order.subtotal || order.total || order.totalPedido || 0).toFixed(2)}
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
                                    <span className="text-orange-600">${(order.total || order.totalPedido || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Estado */}
                        <Card title="Cambiar Estado">
                            <div className="space-y-3">
                                <select
                                    value={order.estado || "Pendiente"}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-orange-400 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En preparación">En Preparación</option>
                                    <option value="Listo para entrega">Listo para entrega</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                                {saving && (
                                    <p className="text-xs text-slate-500 text-center">Actualizando...</p>
                                )}
                            </div>
                        </Card>

                        {/* Notas */}
                        <Card title="Notas">
                            <div className="text-sm text-slate-600">
                                {order.notas || "Sin notas"}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
