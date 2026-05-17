import { useEffect, useMemo, useState } from "react";
import { adminTheme } from "../../../constants/theme";
import { Card, EmptyState } from "../../../shared/components";
import { getAllowedRestaurantIds, getOwnedRestaurants, isRestaurantAdmin } from "../../../shared/utils/restaurantAccess";
import { showError, showSuccess, showConfirm } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { InventoryForm } from "../components/InventoryForm.jsx";
import { useInventoryStore } from "../store/useInventoryStore";

export const InventoryPage = () => {
    const { inventarios, loading, fetchInventarios, createItem, updateItem, deleteItem, clearInventarios } = useInventoryStore();
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const user = useAuthStore((state) => state.user);
    const isAdminRestaurant = isRestaurantAdmin(user);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [restLoading, setRestLoading] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setRestLoading(true);
                await fetchRestaurants();
            } catch {
                console.error("No se pudieron cargar los restaurantes");
            } finally {
                setRestLoading(false);
            }
        };
        loadInitialData();
    }, [fetchRestaurants]);

    const availableRestaurants = useMemo(
        () => getOwnedRestaurants(user, restaurants),
        [restaurants, user]
    );

    const allowedRestaurantIds = useMemo(
        () => getAllowedRestaurantIds(user, restaurants),
        [restaurants, user]
    );

    useEffect(() => {
        if (!isAdminRestaurant) return;
        
        // Si ya hay un restaurante seleccionado y es válido dentro de los permitidos, no lo sobrescribimos
        if (selectedRestaurant && allowedRestaurantIds.includes(selectedRestaurant)) return;

        const onlyRestaurantId = allowedRestaurantIds[0] || (availableRestaurants.length === 1 ? availableRestaurants[0]._id || availableRestaurants[0].id : "");
        if (onlyRestaurantId && selectedRestaurant !== onlyRestaurantId) {
            setSelectedRestaurant(onlyRestaurantId);
        }
    }, [allowedRestaurantIds, availableRestaurants, isAdminRestaurant, selectedRestaurant]);

    useEffect(() => {
        if (!selectedRestaurant) {
            clearInventarios();
            return;
        }
        fetchInventarios(1, 50, selectedRestaurant).catch(() => showError("No se pudo cargar el inventario"));
    }, [clearInventarios, fetchInventarios, selectedRestaurant]);

    const closeModal = () => {
        setOpenModal(false);
        setEditing(null);
    };

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            if (editing) {
                await updateItem(editing._id || editing.id, values);
                showSuccess("Item actualizado");
            } else {
                await createItem(values);
                showSuccess("Item agregado al inventario");
            }
            closeModal();
        } catch (err) {
            showError(err.response?.data?.message || "Error al procesar el item");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = await showConfirm({
            title: "¿Eliminar ingrediente?",
            text: `¿Estás seguro de que deseas eliminar permanentemente "${item.nombreItem}" del inventario de este restaurante?`,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (!confirmed) return;

        try {
            await deleteItem(item._id || item.id);
            showSuccess("Item eliminado");
        } catch {
            showError("No se pudo eliminar el item");
        }
    };

    const handleEdit = (item) => {
        setEditing(item);
        setOpenModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="admin-surface rounded-lg p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="admin-kicker">Control de insumos</p>
                        <h2 className={adminTheme.pageTitle}>Gestion de inventario</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Controla ingredientes y suministros para evitar quiebres de stock.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedRestaurant}
                            onChange={(event) => setSelectedRestaurant(event.target.value)}
                            disabled={isAdminRestaurant && availableRestaurants.length <= 1}
                            className={`w-full sm:w-72 ${adminTheme.select}`}
                        >
                            {!isAdminRestaurant && <option value="">Selecciona un restaurante</option>}
                            {isAdminRestaurant && !availableRestaurants.length && <option value="">Sin restaurante asignado</option>}
                            {availableRestaurants.map((rest) => (
                                <option key={rest._id || rest.id} value={rest._id || rest.id}>
                                    {rest.nombre}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(null);
                                setOpenModal(true);
                            }}
                            className={adminTheme.primaryButton}
                            disabled={!selectedRestaurant}
                        >
                            + Nuevo ingrediente
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Control de insumos</p>
                                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">
                                    {editing ? "Editar ingrediente" : "Nuevo ingrediente"}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                    {editing ? "Actualiza cantidades y stock minimo." : "Registra un ingrediente para el restaurante seleccionado."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                X
                            </button>
                        </div>
                        <div className="p-6">
                            <InventoryForm
                                defaultValues={editing ? {
                                    nombreItem: editing.nombreItem,
                                    cantidad: editing.cantidad,
                                    minStock: editing.minStock,
                                    restaurante: editing.restaurante?._id || editing.restaurante,
                                } : { restaurante: selectedRestaurant }}
                                onSubmit={handleSubmit}
                                onCancel={closeModal}
                                isEditing={!!editing}
                                isLoading={modalLoading}
                                restaurants={availableRestaurants}
                            />
                        </div>
                    </div>
                </div>
            )}

            {(loading || restLoading) && inventarios.length === 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]" />
                    ))}
                </div>
            ) : inventarios.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {inventarios.map((item) => {
                        const isLowStock = Number(item.cantidad) <= Number(item.minStock);
                        return (
                            <Card
                                key={item._id || item.id}
                                className={`group relative transition hover:-translate-y-1 hover:shadow-xl ${isLowStock ? "ring-2 ring-rose-500/70" : ""}`}
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-slate-950" />
                                {isLowStock && (
                                    <div className="absolute right-4 top-4 rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                        Stock bajo
                                    </div>
                                )}

                                <div className="space-y-5 pt-1">
                                    <div className="pr-24">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Ingrediente</p>
                                        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                                            {item.nombreItem}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Existencia</p>
                                            <p className={`mt-2 text-3xl font-black ${isLowStock ? "text-rose-600" : "text-slate-950"}`}>
                                                {item.cantidad}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Minimo</p>
                                            <p className="mt-2 text-3xl font-black text-slate-950">{item.minStock}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => handleEdit(item)} className={adminTheme.outlineButton}>
                                            Editar
                                        </button>
                                        <button type="button" onClick={() => handleDelete(item)} className={adminTheme.destructiveButton}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    title={!selectedRestaurant ? "Selecciona un restaurante" : "Inventario vacio"}
                    description={!selectedRestaurant ? "No hay un restaurante asignado para consultar inventario." : "No hay ingredientes registrados aun para este restaurante."}
                />
            )}
        </div>
    );
};
