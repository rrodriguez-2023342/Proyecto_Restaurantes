import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminTheme } from "../../../constants/theme";
import { Card, DataTable } from "../../../shared/components";
import { getAllowedRestaurantIds, getRelationRestaurantId, isRestaurantAdmin } from "../../../shared/utils/restaurantAccess";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { OrderStatus } from "../components/OrderStatus.jsx";
import { useOrderStore } from "../store/useOrderStore";

const ORDER_TYPE_OPTIONS = ["Domicilio", "Para llevar", "En el restaurante"];
const ORDER_STATUS_OPTIONS = ["Pendiente", "En preparacion", "Listo para entrega", "Entregado", "Cancelado"];

const getOrderTotal = (order) => Number(order.total ?? order.totalPedido ?? 0);
const getOrderStatus = (order) => order.estado || order.estadoPedido || "Pendiente";
const normalizeStatus = (status) => String(status || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const isOrderInProcess = (order) => ["pendiente", "en preparacion"].includes(normalizeStatus(getOrderStatus(order)));
const isOrderDelivered = (order) => normalizeStatus(getOrderStatus(order)) === "entregado";
const formatCurrency = (value) => `Q${Number(value || 0).toFixed(2)}`;

export const OrdersPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isAdminRestaurant = isRestaurantAdmin(user);
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const allowedRestaurantIds = useMemo(() => getAllowedRestaurantIds(user, restaurants), [restaurants, user]);
    const { orders, loading, fetchOrders, deleteOrder, updateOrder, clearOrders } = useOrderStore();
    const { detailOrders, fetchDetailOrders, fetchDetailOrdersByOrderId, deleteDetailOrder } = useDetailOrderStore();
    const [deleting, setDeleting] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);
    const [editValues, setEditValues] = useState({ tipoPedido: "Domicilio", estadoPedido: "Pendiente" });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (isAdminRestaurant) {
            fetchRestaurants().catch(() => {});
        }
    }, [fetchRestaurants, isAdminRestaurant]);

    useEffect(() => {
        if (isAdminRestaurant && !allowedRestaurantIds.length) {
            clearOrders();
            return;
        }

        const params = allowedRestaurantIds.length === 1 ? { restaurante: allowedRestaurantIds[0] } : {};
        fetchOrders(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedRestaurantIds.join("|"), isAdminRestaurant]);

    const filteredOrders = useMemo(() => {
        const scopedOrders =
            isAdminRestaurant && allowedRestaurantIds.length
                ? orders.filter((order) => allowedRestaurantIds.includes(getRelationRestaurantId(order)))
                : orders;
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return scopedOrders;

        return scopedOrders.filter((order) => {
            const values = [
                order.numeroPedido,
                order._id,
                order.id,
                order.restaurante?.nombre,
                order.restaurante?.id,
                order.restaurante,
                order.usuario?.nombre,
                order.usuario?.id,
                order.cliente,
                order.estado,
                order.estadoPedido,
                order.tipoPedido,
            ];
            return values.some((value) => String(value || "").toLowerCase().includes(normalizedSearch));
        });
    }, [allowedRestaurantIds, isAdminRestaurant, orders, searchTerm]);

    const handleDelete = async (order) => {
        const orderLabel = order.numeroPedido || (order._id || order.id)?.slice(-6) || "seleccionado";

        if (!window.confirm(`Estas seguro de que deseas eliminar el pedido #${orderLabel}? Esta accion no se puede deshacer.`)) {
            return;
        }

        try {
            const orderId = order._id || order.id;
            setDeleting(orderId);
            const params = allowedRestaurantIds.length === 1 ? { restaurante: allowedRestaurantIds[0] } : {};
            const latestDetails = await fetchDetailOrders(params);
            const relatedDetailIds = [
                ...new Set(
                    (latestDetails || detailOrders)
                        .filter((detail) => detail.pedido === orderId || detail.pedido?._id === orderId || detail.pedido?.id === orderId)
                        .map((detail) => detail.detailOrderId)
                        .filter(Boolean)
                ),
            ];

            for (const detailId of relatedDetailIds) {
                await deleteDetailOrder(detailId);
            }

            await deleteOrder(orderId);
            showSuccess(`Pedido #${orderLabel} eliminado correctamente`);
        } catch (err) {
            const resp = err.response?.data;
            showError(resp?.message || resp?.error || "No se pudo eliminar el pedido");
        } finally {
            setDeleting(null);
        }
    };

    const handleViewDetail = async (order) => {
        const orderId = order._id || order.id;
        try {
            const details = await fetchDetailOrdersByOrderId(orderId);
            const detailOrderId = details?.[0]?.detailOrderId;
            if (detailOrderId) {
                navigate(`/admin/detail-orders?orderId=${orderId}&detailOrderId=${detailOrderId}`);
                return;
            }
        } catch (err) {
            console.debug("Could not preload order detail", err);
        }
        navigate(`/admin/detail-orders?orderId=${orderId}`);
    };

    const handleOpenEdit = (order) => {
        setEditingOrder(order);
        setEditValues({
            tipoPedido: order.tipoPedido || "Domicilio",
            estadoPedido: order.estado || order.estadoPedido || "Pendiente",
        });
    };

    const handleSaveEdit = async () => {
        if (!editingOrder) return;
        const orderLabel = editingOrder.numeroPedido || editingOrder._id?.slice(-6) || editingOrder.id?.slice(-6) || "seleccionado";

        if (!window.confirm(`Deseas guardar los cambios del pedido #${orderLabel}?`)) return;

        try {
            setSavingEdit(true);
            await updateOrder(editingOrder._id || editingOrder.id, editValues);
            showSuccess(`Pedido #${orderLabel} actualizado correctamente`);
            setEditingOrder(null);
        } catch (err) {
            const resp = err.response?.data;
            showError(resp?.message || resp?.error || "No se pudo editar el pedido");
        } finally {
            setSavingEdit(false);
        }
    };

    const columns = [
        { key: "numeroPedido", header: "Numero", render: (row) => `#${row.numeroPedido || row._id?.slice(-6) || row.id?.slice(-6)}` },
        { key: "restaurante", header: "Restaurante", render: (row) => row.restaurante?.nombre || row.restaurante?.id || row.restaurante || "N/A" },
        { key: "cliente", header: "Cliente", render: (row) => row.usuario?.nombre || row.usuario?.id || row.cliente || "N/A" },
        { key: "tipoPedido", header: "Tipo", render: (row) => row.tipoPedido || "N/A" },
        { key: "total", header: "Total", render: (row) => formatCurrency(getOrderTotal(row)) },
        { key: "estado", header: "Estado", render: (row) => <OrderStatus status={row.estado || row.estadoPedido || "Pendiente"} /> },
        { key: "fecha", header: "Fecha", render: (row) => new Date(row.fechaPedido || row.createdAt).toLocaleDateString("es-ES") },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleViewDetail(row)} className="rounded-lg border border-orange-500/30 bg-white px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-50">
                        Ver
                    </button>
                    <button onClick={() => handleOpenEdit(row)} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                        Editar
                    </button>
                    <button onClick={() => handleDelete(row)} disabled={deleting === (row._id || row.id)} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50">
                        {deleting === (row._id || row.id) ? "..." : "Eliminar"}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className={adminTheme.pageTitle}>Gestion de Pedidos</h2>
                        <p className="mt-1 text-sm text-slate-600">Administra todos los pedidos del sistema.</p>
                    </div>
                    {!isAdminRestaurant && (
                        <button onClick={() => navigate("/admin/orders/create")} className={adminTheme.primaryButton}>
                            Nuevo Pedido
                        </button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        ["Total de Pedidos", orders.length, "text-orange-600"],
                        ["En Proceso", orders.filter(isOrderInProcess).length, "text-blue-600"],
                        ["Entregados", orders.filter(isOrderDelivered).length, "text-emerald-600"],
                        ["Ingresos Totales", formatCurrency(orders.reduce((sum, o) => sum + getOrderTotal(o), 0)), "text-slate-900"],
                    ].map(([label, value, color]) => (
                        <Card key={label}>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            <p className="mt-1 text-sm text-slate-500">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900">Lista de Pedidos</h3>
                            {!loading && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {filteredOrders.length} resultado{filteredOrders.length === 1 ? "" : "s"} encontrado{filteredOrders.length === 1 ? "" : "s"}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por pedido, restaurante, cliente, tipo o estado"
                                className={`${adminTheme.input} w-full sm:w-96`}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className={adminTheme.neutralButton}>
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />
                            ))}
                        </div>
                    ) : (
                        <DataTable columns={columns} rows={filteredOrders} rowKey="_id" emptyLabel="No hay pedidos disponibles" />
                    )}
                </div>
            </div>

            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Editar Pedido</h2>
                                <p className="text-sm text-slate-500">#{editingOrder.numeroPedido || editingOrder._id?.slice(-6) || editingOrder.id?.slice(-6)}</p>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="text-slate-500 hover:text-slate-700">X</button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">Cliente</p>
                                <p className="mt-1 text-sm text-slate-900">{editingOrder.usuario?.nombre || editingOrder.usuario?.id || editingOrder.cliente || "N/A"}</p>
                            </div>
                            <label className="block">
                                <span className={adminTheme.label}>Tipo de Pedido</span>
                                <select value={editValues.tipoPedido} onChange={(e) => setEditValues((current) => ({ ...current, tipoPedido: e.target.value }))} className={`mt-1 w-full ${adminTheme.select}`}>
                                    {ORDER_TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className={adminTheme.label}>Estado</span>
                                <select
                                    value={editValues.estadoPedido}
                                    onChange={(e) => setEditValues((current) => ({ ...current, estadoPedido: e.target.value }))}
                                    disabled={normalizeStatus(editingOrder.estado || editingOrder.estadoPedido) === 'entregado'}
                                    className={`mt-1 w-full ${adminTheme.select}`}
                                >
                                    {ORDER_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                                {normalizeStatus(editingOrder.estado || editingOrder.estadoPedido) === 'entregado' && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Este pedido ya está entregado y su estado no se puede revertir.
                                    </p>
                                )}
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button onClick={() => setEditingOrder(null)} className={adminTheme.neutralButton}>Cancelar</button>
                            <button onClick={handleSaveEdit} disabled={savingEdit} className={adminTheme.primaryButton}>
                                {savingEdit ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
