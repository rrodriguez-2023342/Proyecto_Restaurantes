import { useEffect, useState } from "react";
import { adminTheme } from "../../../constants/theme";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { showError, showSuccess, showConfirm } from "../../../shared/utils/toast";
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
        } catch {
            showError("No se pudieron cargar los restaurantes");
        }
    };

    useEffect(() => {
        fetchMenus();
        fetchRestaurants();
    }, []);

    const closeMenuModal = () => {
        setOpenModal(false);
        setEditing(null);
    };

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            const payload = mapPayload(values);
            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Menu actualizado");
            } else {
                await storeCreate(payload);
                showSuccess("Menu creado");
            }
            closeMenuModal();
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo guardar el menu";
            const detailed = resp?.errors && resp.errors.length ? resp.errors[0].message : null;
            showError(detailed || message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (menu) => {
        const confirmed = await showConfirm({
            title: "¿Eliminar menú?",
            text: `¿Estás seguro de eliminar el menú "${menu.nombreMenu}" permanentemente? Se eliminarán todos sus platos relacionados en cascada.`,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (!confirmed) return;

        try {
            await storeDelete(menu._id || menu.id);
            showSuccess("Menu eliminado");
        } catch {
            showError("No se pudo eliminar el menu");
        }
    };

    const handleToggleStatus = async (menu) => {
        try {
            const nextState = !menu?.isActive;
            await storeUpdate(menu._id || menu.id, { isActive: nextState });
            showSuccess(nextState ? "Menu activado" : "Menu desactivado");
        } catch {
            showError("No se pudo actualizar el estado");
        }
    };

    const resolveImageSrc = (src) => {
        if (!src) return null;
        if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) return src;
        const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
        return base ? `${base}${src}` : src;
    };

    const getRestaurantName = (menu) => {
        if (!menu?.restaurante) return "-";
        if (typeof menu.restaurante === "object") {
            return menu.restaurante.nombre || menu.restaurante.name || "-";
        }
        const found = restaurants.find((item) => (item._id || item.id) === menu.restaurante);
        return found?.nombre || menu.restaurante;
    };

    const shortText = (value, max = 90) => {
        if (!value) return "Sin descripcion";
        const trimmed = String(value).trim();
        if (trimmed.length <= max) return trimmed;
        return `${trimmed.slice(0, max).trim()}...`;
    };

    return (
        <div className="space-y-6">
            <div className="admin-surface rounded-lg p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="admin-kicker">Catalogo comercial</p>
                        <h2 className={adminTheme.pageTitle}>Menus y platos</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Organiza menus por restaurante y consulta sus platos disponibles.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}
                        className={adminTheme.primaryButton}
                    >
                        + Agregar menu
                    </button>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Catalogo comercial</p>
                                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">
                                    {editing ? "Editar menu" : "Nuevo menu"}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                    {editing ? "Actualiza la informacion del menu." : "Crea una nueva carta para un restaurante."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeMenuModal}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                X
                            </button>
                        </div>
                        <div className="max-h-[76vh] overflow-y-auto p-6">
                            <MenuForm
                                defaultValues={editing}
                                onSubmit={handleSubmit}
                                onCancel={closeMenuModal}
                                isLoading={modalLoading}
                                restaurants={restaurants}
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]" />
                    ))}
                </div>
            ) : menus.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {menus.map((menu) => (
                        <Card key={menu?._id || menu?.id} className="transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                {menu?.fotoMenu ? (
                                    <img
                                        src={resolveImageSrc(menu.fotoMenu)}
                                        alt={menu?.nombreMenu || "Menu"}
                                        className="h-44 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-44 w-full items-center justify-center bg-slate-950">
                                        <span className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Sin imagen</span>
                                    </div>
                                )}
                                <div className="absolute inset-x-0 top-0 h-1 bg-slate-950" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-xl font-black tracking-tight text-slate-950">{menu?.nombreMenu}</h3>
                                        <BadgeEstado value={menu?.isActive ? "Activo" : "Inactivo"} />
                                    </div>
                                    <p className="mt-2 min-h-10 text-sm font-medium leading-relaxed text-slate-500">
                                        {shortText(menu?.descripcionMenu)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Restaurante</p>
                                    <p className="mt-1 truncate text-sm font-bold text-slate-800">{getRestaurantName(menu)}</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowPlates(menu)}
                                    className={`${adminTheme.primaryButton} w-full`}
                                >
                                    Ver platos y precios
                                </button>

                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(menu);
                                            setOpenModal(true);
                                        }}
                                        className={adminTheme.outlineButton}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(menu)}
                                        className={adminTheme.neutralButton}
                                    >
                                        {menu?.isActive ? "Desactivar" : "Activar"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(menu)}
                                        className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-rose-700 active:scale-[0.98]"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="Sin menus" description="Crea el primer menu para comenzar" />
            )}

            {showPlates && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)] animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Platos y precios</p>
                                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">{showPlates.nombreMenu}</h3>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                    {getRestaurantName(showPlates)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPlates(null)}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                X
                            </button>
                        </div>

                        <div className="max-h-[55vh] overflow-y-auto p-6 custom-scrollbar">
                            {showPlates.platos?.length ? (
                                <div className="space-y-3">
                                    {showPlates.platos.map((plato) => (
                                        <div key={plato._id || plato.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{plato.nombrePlato}</p>
                                                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Precio registrado</p>
                                            </div>
                                            <span className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-amber-400">
                                                Q{plato.precio}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                    <p className="text-sm font-bold text-slate-500">No hay platos registrados en este menu todavia.</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 px-6 py-4">
                            <button type="button" onClick={() => setShowPlates(null)} className={`${adminTheme.primaryButton} w-full`}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
