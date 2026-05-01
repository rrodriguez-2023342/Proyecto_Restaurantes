import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, DataTable } from "../../../shared/components";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { OrderStatus } from "../components/OrderStatus.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast";

const ORDER_TYPE_OPTIONS = [
    "Domicilio",
    "Para llevar",
    "En el restaurante",
];

const ORDER_STATUS_OPTIONS = [
    "Pendiente",
    "En preparación",
    "Listo para entrega",
    "Entregado",
    "Cancelado",
];

export const OrdersPage = () => {
    const navigate = useNavigate();
    const {
        orders,
        loading,
        fetchOrders,
        deleteOrder,
        updateOrder,
    } = useOrderStore();
    const {
        detailOrders,
        fetchDetailOrders,
        fetchDetailOrdersByOrderId,
        deleteDetailOrder,
    } = useDetailOrderStore();
    const [deleting, setDeleting] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingOrder, setEditingOrder] = useState(null);
    const [editValues, setEditValues] = useState({
        tipoPedido: "Domicilio",
        estadoPedido: "Pendiente",
    });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) return orders;

        return orders.filter((order) => {
            const orderNumber = String(order.numeroPedido || order._id || order.id || "").toLowerCase();
            const restaurant = String(
                order.restaurante?.nombre || order.restaurante?.id || order.restaurante || ""
            ).toLowerCase();
            const client = String(
                order.usuario?.nombre || order.usuario?.id || order.cliente || ""
            ).toLowerCase();
            const status = String(order.estado || order.estadoPedido || "").toLowerCase();
            const type = String(order.tipoPedido || "").toLowerCase();

            return (
                orderNumber.includes(normalizedSearch) ||
                restaurant.includes(normalizedSearch) ||
                client.includes(normalizedSearch) ||
                status.includes(normalizedSearch) ||
                type.includes(normalizedSearch)
            );
        });
    }, [orders, searchTerm]);

    const handleDelete = async (order) => {
        const orderLabel =
            order.numeroPedido || (order._id || order.id)?.slice(-6) || "seleccionado";

        if (
            !window.confirm(
                `¿Estás seguro de que deseas eliminar el pedido #${orderLabel}? Esta acción no se puede deshacer.`
            )
        ) {
            return;
        }

        try {
            const orderId = order._id || order.id;
            setDeleting(orderId);
            const latestDetails = await fetchDetailOrders();

            const relatedDetailIds = [
                ...new Set(
                    (latestDetails || detailOrders)
                        .filter(
                            (detail) =>
                                detail.pedido === orderId ||
                                detail.pedido?._id === orderId ||
                                detail.pedido?.id === orderId
                        )
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
            const message = resp?.message || resp?.error || "No se pudo eliminar el pedido";
            showError(message);
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
                navigate(
                    `/admin/detail-orders?orderId=${orderId}&detailOrderId=${detailOrderId}`
                );
                return;
            }
        } catch (err) {
            // Si falla la consulta previa, igual permitimos navegar al listado filtrado por pedido.
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

        const orderLabel =
            editingOrder.numeroPedido ||
            editingOrder._id?.slice(-6) ||
            editingOrder.id?.slice(-6) ||
            "seleccionado";

        if (!window.confirm(`¿Deseas guardar los cambios del pedido #${orderLabel}?`)) {
            return;
        }

        try {
            setSavingEdit(true);
            await updateOrder(editingOrder._id || editingOrder.id, editValues);
            showSuccess(`Pedido #${orderLabel} actualizado correctamente`);
            setEditingOrder(null);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo editar el pedido";
            showError(message);
        } finally {
            setSavingEdit(false);
        }
    };

    const columns = [
        {
            key: "numeroPedido",
            header: "Número de Pedido",
            render: (row) => `#${row.numeroPedido || row._id?.slice(-6) || row.id?.slice(-6)}`,
        },
        {
            key: "restaurante",
            header: "Restaurante",
            render: (row) => row.restaurante?.nombre || row.restaurante?.id || row.restaurante || "N/A",
        },
        {
            key: "cliente",
            header: "Cliente",
            render: (row) => row.usuario?.nombre || row.usuario?.id || row.cliente || "N/A",
        },
        {
            key: "tipoPedido",
            header: "Tipo",
            render: (row) => row.tipoPedido || "N/A",
        },
        {
            key: "total",
            header: "Total",
            render: (row) => `$${(row.total || row.totalPedido || 0).toFixed(2)}`,
        },
        {
            key: "estado",
            header: "Estado",
            render: (row) => <OrderStatus status={row.estado || row.estadoPedido || "Pendiente"} />,
        },
        {
            key: "fecha",
            header: "Fecha",
            render: (row) =>
                new Date(row.fechaPedido || row.createdAt).toLocaleDateString("es-ES"),
        },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleViewDetail(row)}
                        className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition"
                    >
                        Ver Detalle
                    </button>
                    <button
                        onClick={() => handleOpenEdit(row)}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={deleting === (row._id || row.id)}
                        className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition disabled:opacity-50"
                    >
                        {deleting === (row._id || row.id) ? "..." : "Eliminar"}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Pedidos</h1>
                        <p className="mt-1 text-slate-600">
                            Administra todos los pedidos del sistema
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/orders/create")}
                        className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-400 hover:to-orange-500 transition"
                    >
                        + Nuevo Pedido
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {orders.length}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Total de Pedidos</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">
                                {orders.filter((o) => o.estado === "Pendiente" || o.estado === "En preparación").length}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">En Proceso</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-emerald-600">
                                {orders.filter((o) => o.estado === "Entregado").length}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Entregados</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-900">
                                ${orders.reduce((sum, o) => sum + (o.total || o.totalPedido || 0), 0).toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Ingresos Totales</p>
                        </div>
                    </Card>
                </div>

                <Card
                    title="Lista de Pedidos"
                    action={
                        <div className="flex items-center gap-2">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por pedido, restaurante, cliente, tipo o estado"
                                className="w-80 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    }
                >
                    {!loading && (
                        <p className="mb-4 text-xs text-slate-500">
                            {filteredOrders.length} resultado{filteredOrders.length === 1 ? "" : "s"} encontrado{filteredOrders.length === 1 ? "" : "s"}
                        </p>
                    )}

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 animate-pulse rounded-lg bg-slate-200"
                                />
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={filteredOrders}
                            rowKey="_id"
                            emptyLabel="No hay pedidos disponibles"
                        />
                    )}
                </Card>
            </div>

            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Editar Pedido</h2>
                                <p className="text-sm text-slate-500">
                                    #{editingOrder.numeroPedido || editingOrder._id?.slice(-6) || editingOrder.id?.slice(-6)}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">Cliente</p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {editingOrder.usuario?.nombre || editingOrder.usuario?.id || editingOrder.cliente || "N/A"}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase text-slate-500">
                                    Tipo de Pedido
                                </label>
                                <select
                                    value={editValues.tipoPedido}
                                    onChange={(e) =>
                                        setEditValues((current) => ({
                                            ...current,
                                            tipoPedido: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                >
                                    {ORDER_TYPE_OPTIONS.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase text-slate-500">
                                    Estado
                                </label>
                                <select
                                    value={editValues.estadoPedido}
                                    onChange={(e) =>
                                        setEditValues((current) => ({
                                            ...current,
                                            estadoPedido: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                >
                                    {ORDER_STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition disabled:opacity-50"
                            >
                                {savingEdit ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
