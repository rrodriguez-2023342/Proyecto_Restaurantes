import { useEffect, useMemo, useState } from "react";
import { Card, EmptyState } from "../../../shared/components";
import { getAllowedRestaurantIds, getOwnedRestaurants, isRestaurantAdmin } from "../../../shared/utils/restaurantAccess";
import { showError, showSuccess } from "../../../shared/utils/toast";
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
            } catch (err) {
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

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            if (editing) {
                await updateItem(editing._id || editing.id, values);
                showSuccess("Ítem actualizado");
            } else {
                await createItem(values);
                showSuccess("Ítem agregado al inventario");
            }
            setOpenModal(false);
            setEditing(null);
        } catch (err) {
            showError(err.response?.data?.message || "Error al procesar el ítem");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`¿Eliminar ${item.nombreItem} del inventario?`)) return;
        try {
            await deleteItem(item._id || item.id);
            showSuccess("Ítem eliminado");
        } catch (err) {
            showError("No se pudo eliminar el ítem");
        }
    };

    const handleEdit = (item) => {
        setEditing(item);
        setOpenModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Gestión de Inventario</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Controla los ingredientes y suministros de tu restaurante para evitar quiebres de stock.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            disabled={isAdminRestaurant && availableRestaurants.length <= 1}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none"
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
                            onClick={() => {
                                setEditing(null);
                                setOpenModal(true);
                            }}
                            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
                            disabled={!selectedRestaurant}
                        >
                            + Nuevo Ingrediente
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editing ? "Editar ingrediente" : "Nuevo ingrediente"}
                            </h3>
                            <button
                                onClick={() => {
                                    setOpenModal(false);
                                    setEditing(null);
                                }}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <InventoryForm
                                defaultValues={editing ? {
                                    nombreItem: editing.nombreItem,
                                    cantidad: editing.cantidad,
                                    minStock: editing.minStock,
                                    restaurante: editing.restaurante?._id || editing.restaurante,
                                } : {}}
                                onSubmit={handleSubmit}
                                isEditing={!!editing}
                                isLoading={modalLoading}
                                restaurants={availableRestaurants}
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading && inventarios.length === 0 ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                </div>
            ) : inventarios.length ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {inventarios.map((item) => {
                        const isLowStock = item.cantidad <= item.minStock;
                        return (
                            <Card key={item._id || item.id} className={`group relative overflow-hidden transition-all hover:shadow-xl ${isLowStock ? 'ring-2 ring-rose-500' : 'hover:-translate-y-1'}`}>
                                {isLowStock && (
                                    <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                                        Stock Bajo
                                    </div>
                                )}
                                <div className="p-1">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                        {item.nombreItem}
                                    </h3>
                                    
                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Existencia</p>
                                            <p className={`text-3xl font-black ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {item.cantidad}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mínimo</p>
                                            <p className="font-bold text-slate-600">{item.minStock}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-orange-100 hover:text-orange-700"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-rose-100 hover:text-rose-700"
                                        >
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
                    title={!selectedRestaurant ? "Selecciona un restaurante" : "Inventario vacío"}
                    description={!selectedRestaurant ? "No hay un restaurante asignado para consultar inventario." : "No hay ingredientes registrados aún para este restaurante."} 
                />
            )}
        </div>
    );
};
