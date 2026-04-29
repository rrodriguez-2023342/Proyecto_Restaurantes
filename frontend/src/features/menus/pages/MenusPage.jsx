import { useEffect, useState } from "react";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { MenuForm } from "../components/MenuForm.jsx";
import { useMenuStore } from "../store/useMenuStore";

const mapPayload = (values) => {
    const payload = new FormData();
    payload.append("nombreMenu", values.name);
    payload.append("descripcionMenu", values.description);
    payload.append("restaurante", values.restaurantId);
    payload.append("isActive", values.active === true || values.active === "true" ? "true" : "false");
    
    if (values.photo?.length) {
        payload.append("fotoMenu", values.photo[0]);
    }
    
    return payload;
};

export const MenusPage = () => {
    const { menus, loading, fetchMenus, createMenu: storeCreate, updateMenu: storeUpdate, deleteMenu: storeDelete } = useMenuStore();
    const [restaurants, setRestaurants] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [showPlates, setShowPlates] = useState(null);

    const fetchRestaurants = async () => {
        try {
            const { data } = await getRestaurants();
            setRestaurants(data?.data || data?.restaurantes || data || []);
        } catch (err) {
            showError("No se pudieron cargar los restaurantes");
        }
    };

    useEffect(() => {
        fetchMenus();
        fetchRestaurants();
    }, []);

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            const payload = mapPayload(values);
            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Menú actualizado");
            } else {
                await storeCreate(payload);
                showSuccess("Menú creado");
            }
            setOpenModal(false);
            setEditing(null);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo guardar el menú";
            const detailed = resp?.errors && resp.errors.length ? resp.errors[0].message : null;
            showError(detailed || message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (menu) => {
        if (!confirm("¿Eliminar este menú?")) return;
        try {
            await storeDelete(menu._id || menu.id);
            showSuccess("Menú eliminado");
        } catch (err) {
            showError("No se pudo eliminar el menú");
        }
    };

    const handleToggleStatus = async (menu) => {
        try {
            const nextState = !menu?.isActive;
            await storeUpdate(menu._id || menu.id, { isActive: nextState });
            showSuccess(nextState ? "Menú activado" : "Menú desactivado");
        } catch (err) {
            showError("No se pudo actualizar el estado");
        }
    };
    

    const resolveImageSrc = (src) => {
        if (!src) return null;
        if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
            return src;
        }
        const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
        if (base) return `${base}${src}`;
        return src;
    };

    const getRestaurantName = (menu) => {
        if (!menu?.restaurante) return "-";
        if (typeof menu.restaurante === "object") {
            return menu.restaurante.nombre || menu.restaurante.name || "-";
        }
        const found = restaurants.find(
            (item) => (item._id || item.id) === menu.restaurante
        );
        return found?.nombre || menu.restaurante;
    };

    const shortText = (value, max = 80) => {
        if (!value) return "-";
        const trimmed = String(value).trim();
        if (trimmed.length <= max) return trimmed;
        return `${trimmed.slice(0, max).trim()}...`;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Menús y platos</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Organiza menús por restaurante y agrega platos destacados.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}
                        className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-white font-medium hover:shadow-lg transition-shadow"
                    >
                        + Agregar menú
                    </button>
                </div>
            </div>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="rounded-2xl bg-white shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editing ? "Editar menú" : "Nuevo menú"}
                            </h3>
                            <button
                                onClick={() => {
                                    setOpenModal(false);
                                    setEditing(null);
                                }}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <MenuForm
                                defaultValues={editing}
                                onSubmit={handleSubmit}
                                isLoading={modalLoading}
                                restaurants={restaurants}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Menús */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-600">Cargando menús...</p>
                </div>
            ) : menus.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {menus.map((menu) => (
                        <Card
                            key={menu?._id || menu?.id}
                            className="transition hover:-translate-y-1 hover:shadow-md"
                        >
                            {menu?.fotoMenu ? (
                                <img
                                    src={resolveImageSrc(menu.fotoMenu)}
                                    alt={menu?.nombreMenu || "Menú"}
                                    className="mb-3 h-40 w-full rounded-xl object-contain bg-slate-100"
                                />
                            ) : (
                                <div className="mb-3 h-40 w-full rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
                            )}
                            <h3 className="font-semibold text-slate-900">{menu?.nombreMenu}</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {shortText(menu?.descripcionMenu, 80)}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                                    🏪 {getRestaurantName(menu)}
                                </span>
                                <BadgeEstado value={menu?.isActive ? "Activo" : "Inactivo"} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPlates(menu)}
                                className="mt-4 w-full rounded-lg bg-orange-600 py-2 text-xs font-bold text-white hover:bg-orange-700 transition shadow-sm"
                            >
                                Ver platos y precios
                            </button>
                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(menu);
                                        setOpenModal(true);
                                    }}
                                    className="flex-1 rounded-lg border border-orange-200 bg-orange-50 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(menu)}
                                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    {menu?.isActive ? "Desactivar" : "Activar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(menu)}
                                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="Sin menús" description="Crea el primer menú para comenzar" />
            )}

            {/* Plates Modal */}
            {showPlates && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{showPlates.nombreMenu}</h3>
                                <p className="text-xs text-slate-500">Platos disponibles</p>
                            </div>
                            <button onClick={() => setShowPlates(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        
                        <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {showPlates.platos?.length ? (
                                <div className="space-y-3">
                                    {showPlates.platos.map((plato) => (
                                        <div key={plato._id || plato.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                            <span className="text-sm font-semibold text-slate-700">{plato.nombrePlato}</span>
                                            <span className="text-sm font-bold text-orange-600">Q{plato.precio}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">🍽️</div>
                                    <p className="text-sm text-slate-500 italic">No hay platos registrados en este menú todavía.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowPlates(null)}
                            className="mt-8 w-full rounded-xl bg-orange-600 py-3 text-sm font-bold text-white hover:bg-orange-500 transition shadow-lg"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
