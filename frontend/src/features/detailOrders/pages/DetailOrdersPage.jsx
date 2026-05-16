import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, DataTable } from "../../../shared/components";
import { getAllowedRestaurantIds, getRelationRestaurantId, isRestaurantAdmin } from "../../../shared/utils/restaurantAccess";
import { useAuthStore } from "../../auth/store/authStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useDetailOrderStore } from "../store/useDetailOrderStore";
import { showError, showSuccess } from "../../../shared/utils/toast";

const getPlatoId = (item) =>
    item?.plato?._id || item?.plato?.id || item?.plato;

export const DetailOrdersPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const isAdminRestaurant = isRestaurantAdmin(user);
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const allowedRestaurantIds = useMemo(
        () => getAllowedRestaurantIds(user, restaurants),
        [restaurants, user]
    );
    const orderId = searchParams.get("orderId");
    const detailOrderIdParam = searchParams.get("detailOrderId");
    const {
        detailOrders,
        loading,
        fetchDetailOrders,
        clearDetailOrders,
        deleteDetailOrder,
        updateDetailOrder,
    } = useDetailOrderStore();
    const [deleting, setDeleting] = useState(null);
    const [searchTerm, setSearchTerm] = useState(detailOrderIdParam || "");
    const [editingItem, setEditingItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState(1);
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (isAdminRestaurant) {
            fetchRestaurants().catch(() => {});
        }
    }, [fetchRestaurants, isAdminRestaurant]);

    useEffect(() => {
        const loadDetails = async () => {
            if (isAdminRestaurant && !allowedRestaurantIds.length) {
                clearDetailOrders();
                return;
            }

            try {
                const params = allowedRestaurantIds.length === 1 ? { restaurante: allowedRestaurantIds[0] } : {};
                await fetchDetailOrders(params);
            } catch (err) {
                const resp = err.response?.data;
                const message =
                    resp?.message ||
                    "No se pudieron cargar los detalles de pedidos";
                showError(message);
            }
        };

        loadDetails();
    }, [allowedRestaurantIds, clearDetailOrders, fetchDetailOrders, isAdminRestaurant, orderId]);

    useEffect(() => {
        setSearchTerm(detailOrderIdParam || "");
    }, [detailOrderIdParam]);

    const visibleDetails = useMemo(() => {
        const restaurantScopedDetails =
            isAdminRestaurant && allowedRestaurantIds.length
                ? detailOrders.filter((detail) => allowedRestaurantIds.includes(getRelationRestaurantId(detail.pedido)))
                : detailOrders;

        const scopedDetails = !orderId
            ? restaurantScopedDetails
            : restaurantScopedDetails.filter(
                (detail) =>
                    detail.pedido === orderId ||
                    detail.pedido?._id === orderId ||
                    detail.pedido?.id === orderId
            );

        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return scopedDetails;

        return scopedDetails.filter((detail) => {
            const detailOrderId = String(detail.detailOrderId || detail._id || detail.id || "").toLowerCase();
            const orderNumber = String(
                detail.pedido?.numeroPedido ||
                detail.pedido?._id?.slice?.(-6) ||
                detail.pedido?.id?.slice?.(-6) ||
                detail.numeroPedido ||
                ""
            ).toLowerCase();
            const dishName = String(
                detail.plato?.nombre ||
                detail.plato?.nombrePlato ||
                detail.nombrePlato ||
                ""
            ).toLowerCase();
            const quantity = String(detail.cantidad || "");

            return (
                detailOrderId.includes(normalizedSearch) ||
                orderNumber.includes(normalizedSearch) ||
                dishName.includes(normalizedSearch) ||
                quantity.includes(normalizedSearch)
            );
        });
    }, [allowedRestaurantIds, detailOrders, isAdminRestaurant, orderId, searchTerm]);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar el detalle de pedido ${id}? Esta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            setDeleting(id);
            await deleteDetailOrder(id);
            showSuccess(`Detalle de pedido ${id} eliminado correctamente`);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || "No se pudo eliminar el detalle de pedido";
            showError(message);
        } finally {
            setDeleting(null);
        }
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setEditQuantity(item.cantidad || 1);
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        if (!editQuantity || editQuantity < 1) {
            showError("La cantidad debe ser mayor a 0");
            return;
        }

        const detailId = editingItem.detailOrderId || editingItem._id || editingItem.id;
        const confirmed = window.confirm(
            `¿Deseas guardar los cambios del detalle de pedido ${detailId}?`
        );

        if (!confirmed) return;

        const detailItems = detailOrders
            .filter((item) => item.detailOrderId === detailId)
            .map((item) => ({
                plato: getPlatoId(item),
                cantidad:
                    item._id === editingItem._id
                        ? Number(editQuantity)
                        : Number(item.cantidad || 1),
            }));

        try {
            setSavingEdit(true);
            await updateDetailOrder(detailId, { items: detailItems });
            showSuccess(`Detalle de pedido ${detailId} actualizado correctamente`);
            setEditingItem(null);
        } catch (err) {
            const resp = err.response?.data;
            const message =
                resp?.message || resp?.error || "No se pudieron guardar los cambios del detalle";
            showError(message);
        } finally {
            setSavingEdit(false);
        }
    };

    const totalValue = visibleDetails.reduce((sum, item) => {
        return sum + (item.subtotal || item.cantidad * item.precioUnitario || 0);
    }, 0);

    const columns = [
        {
            key: "detailOrderId",
            header: "ID Detalle",
            render: (row) => row.detailOrderId || row._id || row.id || "N/A",
        },
        {
            key: "numeroPedido",
            header: "Pedido",
            render: (row) =>
                `#${row.pedido?.numeroPedido || row.pedido?._id?.slice(-6) || row.pedido?.id?.slice(-6) || row.numeroPedido || "N/A"}`,
        },
        {
            key: "plato",
            header: "Plato",
            render: (row) => row.plato?.nombre || row.plato?.nombrePlato || row.nombrePlato || "N/A",
        },
        {
            key: "cantidad",
            header: "Cantidad",
        },
        {
            key: "precioUnitario",
            header: "Precio Unitario",
            render: (row) => `$${(row.precioUnitario || 0).toFixed(2)}`,
        },
        {
            key: "subtotal",
            header: "Subtotal",
            render: (row) => {
                const sub = row.subtotal || row.cantidad * row.precioUnitario;
                return `$${sub.toFixed(2)}`;
            },
        },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenEdit(row)}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => handleDelete(row.detailOrderId || row._id || row.id)}
                        disabled={deleting === (row.detailOrderId || row._id || row.id)}
                        className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition disabled:opacity-50"
                    >
                        {deleting === (row.detailOrderId || row._id || row.id) ? "..." : "Eliminar"}
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
                        <h1 className="text-3xl font-bold text-slate-900">
                            Detalles de Pedidos
                        </h1>
                        <p className="mt-1 text-slate-600">
                            {orderId
                                ? `Detalle del pedido #${orderId.slice(-6)}`
                                : "Gestiona los artículos individuales de los pedidos"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {orderId && (
                            <button
                                onClick={() => navigate("/admin/detail-orders")}
                                className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition"
                            >
                                Ver todos
                            </button>
                        )}
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Ir a Pedidos
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {visibleDetails.length}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Total de Artículos</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-900">
                                {new Set(
                                    visibleDetails.map((d) => d.pedido?._id || d.pedido?.id || d.pedido)
                                ).size}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Pedidos Únicos</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-900">
                                ${totalValue.toFixed(2)}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">Valor Total</p>
                        </div>
                    </Card>
                </div>

                <Card
                    title="Tabla de Detalles"
                    action={
                        <div className="flex items-center gap-2">
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por ID detalle, pedido, plato o cantidad"
                                className="w-72 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
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
                            {visibleDetails.length} resultado{visibleDetails.length === 1 ? "" : "s"} encontrado{visibleDetails.length === 1 ? "" : "s"}
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
                            rows={visibleDetails}
                            rowKey="_id"
                            emptyLabel="No hay detalles de pedidos"
                        />
                    )}
                </Card>
            </div>

            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Editar Detalle</h2>
                                <p className="text-sm text-slate-500">
                                    Vas a modificar el detalle del plato{" "}
                                    {editingItem.plato?.nombre ||
                                        editingItem.plato?.nombrePlato ||
                                        editingItem.nombrePlato ||
                                        "seleccionado"}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">ID Detalle</p>
                                <p className="mt-1 break-all text-sm text-slate-900">
                                    {editingItem.detailOrderId || editingItem._id || editingItem.id || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">Pedido</p>
                                <p className="mt-1 text-sm text-slate-900">
                                    #{editingItem.pedido?.numeroPedido || editingItem.pedido?._id?.slice(-6) || editingItem.pedido?.id?.slice(-6) || "N/A"}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase text-slate-500">
                                    Cantidad
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                onClick={() => setEditingItem(null)}
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
