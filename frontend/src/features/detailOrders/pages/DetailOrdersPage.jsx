import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminTheme } from "../../../constants/theme";
import { Card, DataTable } from "../../../shared/components";
import { getAllowedRestaurantIds, getRelationRestaurantId, isRestaurantAdmin } from "../../../shared/utils/restaurantAccess";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useDetailOrderStore } from "../store/useDetailOrderStore";

const getPlatoId = (item) =>
    item?.plato?._id || item?.plato?.id || item?.plato;

const formatCurrency = (value) => `Q${Number(value || 0).toFixed(2)}`;

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
                showError(resp?.message || "No se pudieron cargar los detalles de pedidos");
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
        if (!window.confirm(`Eliminar el detalle de pedido ${id}? Esta accion no se puede deshacer.`)) return;

        try {
            setDeleting(id);
            await deleteDetailOrder(id);
            showSuccess(`Detalle de pedido ${id} eliminado correctamente`);
        } catch (err) {
            const resp = err.response?.data;
            showError(resp?.message || "No se pudo eliminar el detalle de pedido");
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
        if (!window.confirm(`Deseas guardar los cambios del detalle de pedido ${detailId}?`)) return;

        const detailItems = detailOrders
            .filter((item) => item.detailOrderId === detailId)
            .map((item) => ({
                plato: getPlatoId(item),
                cantidad: item._id === editingItem._id ? Number(editQuantity) : Number(item.cantidad || 1),
            }));

        try {
            setSavingEdit(true);
            await updateDetailOrder(detailId, { items: detailItems });
            showSuccess(`Detalle de pedido ${detailId} actualizado correctamente`);
            setEditingItem(null);
        } catch (err) {
            const resp = err.response?.data;
            showError(resp?.message || resp?.error || "No se pudieron guardar los cambios del detalle");
        } finally {
            setSavingEdit(false);
        }
    };

    const totalValue = visibleDetails.reduce((sum, item) => {
        return sum + (item.subtotal || item.cantidad * item.precioUnitario || 0);
    }, 0);

    const uniqueOrders = new Set(
        visibleDetails.map((detail) => detail.pedido?._id || detail.pedido?.id || detail.pedido)
    ).size;

    const columns = [
        {
            key: "detailOrderId",
            header: "ID Detalle",
            render: (row) => (
                <span className="font-mono text-xs text-slate-600">{row.detailOrderId || row._id || row.id || "N/A"}</span>
            ),
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
        { key: "cantidad", header: "Cantidad" },
        {
            key: "precioUnitario",
            header: "Precio Unitario",
            render: (row) => formatCurrency(row.precioUnitario),
        },
        {
            key: "subtotal",
            header: "Subtotal",
            render: (row) => formatCurrency(row.subtotal || row.cantidad * row.precioUnitario),
        },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => {
                const id = row.detailOrderId || row._id || row.id;
                return (
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleOpenEdit(row)} className={adminTheme.outlineButton}>
                            Editar
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(id)}
                            disabled={deleting === id}
                            className={adminTheme.destructiveButton}
                        >
                            {deleting === id ? "..." : "Eliminar"}
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="admin-surface rounded-lg p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="admin-kicker">Operacion comercial</p>
                        <h1 className={adminTheme.pageTitle}>Detalles de pedidos</h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            {orderId ? `Detalle del pedido #${orderId.slice(-6)}` : "Gestiona los articulos individuales de los pedidos."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {orderId && (
                            <button type="button" onClick={() => navigate("/admin/detail-orders")} className={adminTheme.outlineButton}>
                                Ver todos
                            </button>
                        )}
                        <button type="button" onClick={() => navigate("/admin/orders")} className={adminTheme.primaryButton}>
                            Ir a pedidos
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    ["Total de articulos", visibleDetails.length],
                    ["Pedidos unicos", uniqueOrders],
                    ["Valor total", formatCurrency(totalValue)],
                ].map(([label, value]) => (
                    <Card key={label} accent>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
                        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
                    </Card>
                ))}
            </div>

            <div className="admin-surface rounded-lg p-5">
                <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Tabla de detalles</h3>
                        {!loading && (
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                {visibleDetails.length} resultado{visibleDetails.length === 1 ? "" : "s"} encontrado{visibleDetails.length === 1 ? "" : "s"}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar por ID, pedido, plato o cantidad"
                            className={`w-full sm:w-96 ${adminTheme.input}`}
                        />
                        {searchTerm && (
                            <button type="button" onClick={() => setSearchTerm("")} className={adminTheme.neutralButton}>
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-200" />
                        ))}
                    </div>
                ) : (
                    <DataTable columns={columns} rows={visibleDetails} rowKey="_id" emptyLabel="No hay detalles de pedidos" />
                )}
            </div>

            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Detalle de pedido</p>
                                <h2 className="mt-2 text-xl font-black uppercase tracking-tight">Editar detalle</h2>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                    {editingItem.plato?.nombre || editingItem.plato?.nombrePlato || editingItem.nombrePlato || "Plato seleccionado"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">ID Detalle</p>
                                <p className="mt-2 break-all font-mono text-xs text-slate-700">
                                    {editingItem.detailOrderId || editingItem._id || editingItem.id || "N/A"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Pedido</p>
                                <p className="mt-2 text-sm font-black text-slate-950">
                                    #{editingItem.pedido?.numeroPedido || editingItem.pedido?._id?.slice(-6) || editingItem.pedido?.id?.slice(-6) || "N/A"}
                                </p>
                            </div>

                            <label className="block">
                                <span className={adminTheme.label}>Cantidad</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={editQuantity}
                                    onChange={(event) => setEditQuantity(Number(event.target.value))}
                                    className={`mt-2 w-full ${adminTheme.input}`}
                                />
                            </label>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setEditingItem(null)} className={adminTheme.neutralButton}>
                                Cancelar
                            </button>
                            <button type="button" onClick={handleSaveEdit} disabled={savingEdit} className={adminTheme.primaryButton}>
                                {savingEdit ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
