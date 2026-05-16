import { useEffect, useMemo, useState } from "react";
import { adminTheme } from "../../../constants/theme";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { getMenus } from "../../../shared/api";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useInventoryStore } from "../../inventory/store/useInventoryStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { DishForm } from "../components/DishForm.jsx";
import { usePlatoStore } from "../store/usePlatoStore";

const typeLabels = {
    ENTRADA: "Entrada",
    PLATO_FUERTE: "Plato fuerte",
    POSTRE: "Postre",
    BEBIDA: "Bebida",
};

const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) return src;
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    return base ? `${base}${src}` : src;
};

const parseIngredients = (ingredients) => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients;
    if (typeof ingredients === "string") {
        try {
            return JSON.parse(ingredients);
        } catch {
            return [ingredients];
        }
    }
    return [];
};

const shortText = (value, max = 90) => {
    if (!value) return "Sin descripcion";
    const trimmed = String(value).trim();
    if (trimmed.length <= max) return trimmed;
    return `${trimmed.slice(0, max).trim()}...`;
};

export const PlatosPage = () => {
    const { platos, loading, fetchPlatos, createPlato: storeCreate, updatePlato: storeUpdate, deletePlato: storeDelete } = usePlatoStore();
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const [menus, setMenus] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [selectedMenu, setSelectedMenu] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [menuLoading, setMenuLoading] = useState(false);
    const { inventarios, fetchInventarios, clearInventarios } = useInventoryStore();

    useEffect(() => {
        fetchRestaurants().catch(() => showError("No se pudieron cargar los restaurantes"));
    }, [fetchRestaurants]);

    useEffect(() => {
        if (!selectedRestaurant && restaurants.length === 1) {
            setSelectedRestaurant(restaurants[0]._id || restaurants[0].id);
        }
    }, [restaurants, selectedRestaurant]);

    useEffect(() => {
        const loadMenus = async () => {
            if (!selectedRestaurant) {
                setMenus([]);
                setSelectedMenu("");
                clearInventarios();
                return;
            }
            try {
                setMenuLoading(true);
                await fetchInventarios(1, 50, selectedRestaurant);
                const { data } = await getMenus({ restaurante: selectedRestaurant });
                const loadedMenus = data?.data || data?.menus || data || [];
                setMenus(loadedMenus);
                setSelectedMenu(loadedMenus.length ? loadedMenus[0]._id || loadedMenus[0].id : "");
            } catch {
                showError("No se pudieron cargar los menus");
            } finally {
                setMenuLoading(false);
            }
        };

        loadMenus();
    }, [clearInventarios, fetchInventarios, selectedRestaurant]);

    useEffect(() => {
        if (!selectedMenu) return;
        fetchPlatos(selectedMenu).catch(() => showError("No se pudieron cargar los platos para el menu seleccionado"));
    }, [fetchPlatos, selectedMenu]);

    const selectedMenuData = useMemo(
        () => menus.find((menu) => (menu._id || menu.id) === selectedMenu),
        [menus, selectedMenu]
    );

    const closeModal = () => {
        setOpenModal(false);
        setEditing(null);
    };

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            const targetMenu = values.menuId || selectedMenu;
            const payload = new FormData();
            payload.append("nombrePlato", values.name);
            payload.append("descripcionPlato", values.description || "");
            payload.append("precio", values.price);
            payload.append("tipoPlato", values.type);
            payload.append("menu", targetMenu);

            if (values.ingredients) payload.append("ingredientes", values.ingredients);
            if (values.photo?.length) payload.append("fotosPlato", values.photo[0]);

            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Plato actualizado");
            } else {
                await storeCreate(payload);
                showSuccess("Plato creado");
            }

            closeModal();
            setSelectedMenu(targetMenu);
            await fetchPlatos(targetMenu);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo guardar el plato";
            const detailed = resp?.errors?.length ? resp.errors[0].message : null;
            showError(detailed || message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (plato) => {
        if (!confirm("Eliminar este plato?")) return;
        try {
            await storeDelete(plato._id || plato.id);
            showSuccess("Plato eliminado");
        } catch {
            showError("No se pudo eliminar el plato");
        }
    };

    const handleEdit = (plato) => {
        setEditing(plato);
        setOpenModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="admin-surface rounded-lg p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="admin-kicker">Produccion culinaria</p>
                        <h2 className={adminTheme.pageTitle}>Gestion de platos</h2>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Crea, edita y administra platos por menu con control de ingredientes.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                            <select
                                value={selectedRestaurant}
                                onChange={(event) => setSelectedRestaurant(event.target.value)}
                                className={`w-full ${adminTheme.select}`}
                            >
                                <option value="">Restaurante...</option>
                                {restaurants.map((rest) => (
                                    <option key={rest._id || rest.id} value={rest._id || rest.id}>
                                        {rest.nombre}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedMenu}
                                onChange={(event) => setSelectedMenu(event.target.value)}
                                className={`w-full ${adminTheme.select}`}
                                disabled={!selectedRestaurant || menuLoading}
                            >
                                <option value="">{menuLoading ? "Cargando..." : "Selecciona un menu"}</option>
                                {menus.map((menu) => (
                                    <option key={menu._id || menu.id} value={menu._id || menu.id}>
                                        {menu.nombreMenu || menu.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setEditing(null);
                                setOpenModal(true);
                            }}
                            disabled={!selectedRestaurant || !selectedMenu}
                            className={`${adminTheme.primaryButton} w-full lg:w-auto`}
                        >
                            + Agregar plato
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Produccion culinaria</p>
                                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">
                                    {editing ? "Editar plato" : "Nuevo plato"}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-400">
                                    {editing ? "Actualiza la ficha del producto." : "Registra un plato dentro del menu seleccionado."}
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
                        <div className="max-h-[76vh] overflow-y-auto p-6">
                            <DishForm
                                menus={menus}
                                defaultValues={editing ? {
                                    name: editing.nombrePlato,
                                    description: editing.descripcionPlato,
                                    price: editing.precio,
                                    type: editing.tipoPlato,
                                    ingredients: editing.ingredientes,
                                    menuId: editing.menu?._id || editing.menu,
                                } : { menuId: selectedMenu }}
                                onSubmit={handleSubmit}
                                onCancel={closeModal}
                                isEditing={!!editing}
                                isLoading={modalLoading}
                                restaurantId={selectedRestaurant}
                            />
                        </div>
                    </div>
                </div>
            )}

            {menuLoading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]" />
                    ))}
                </div>
            ) : !menus.length ? (
                <EmptyState title="Sin menus disponibles" description="Crea un menu primero para agregar platos." />
            ) : !selectedMenu ? (
                <EmptyState title="Selecciona un menu" description="Elige un menu para ver y administrar sus platos." />
            ) : loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]" />
                    ))}
                </div>
            ) : platos.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {platos.map((plato) => (
                        <Card key={plato._id || plato.id} className="transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                {plato?.fotosPlato ? (
                                    <img
                                        src={resolveImageSrc(plato.fotosPlato)}
                                        alt={plato.nombrePlato || "Plato"}
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
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-xl font-black tracking-tight text-slate-950">{plato.nombrePlato}</h3>
                                        <p className="mt-1 text-sm font-semibold text-slate-500">{typeLabels[plato.tipoPlato] || "Tipo desconocido"}</p>
                                    </div>
                                    <span className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-amber-400">
                                        Q{plato.precio}
                                    </span>
                                </div>

                                <p className="min-h-10 text-sm font-medium leading-relaxed text-slate-500">
                                    {shortText(plato.descripcionPlato)}
                                </p>

                                <div className="flex flex-wrap gap-2 text-xs">
                                    <BadgeEstado value={plato.menu?.nombreMenu || selectedMenuData?.nombreMenu || "Menu"} />
                                    {parseIngredients(plato.ingredientes).map((ingredient, idx) => {
                                        const idToSearch = ingredient?.itemInventario?._id || ingredient?.itemInventario?.id || ingredient?.itemInventario || ingredient;
                                        const found = inventarios.find((item) => item._id === idToSearch || item.id === idToSearch);
                                        const name = found?.nombreItem || ingredient?.itemInventario?.nombreItem || ingredient?.itemInventario?.nombre || idToSearch;
                                        const amount = ingredient?.cantidad;
                                        const label = name && amount != null && amount !== "" ? `${name} x${amount}` : name;

                                        return label ? (
                                            <span key={`${plato._id || plato.id}-ingredient-${idx}`} className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                                {label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => handleEdit(plato)} className={adminTheme.outlineButton}>
                                        Editar
                                    </button>
                                    <button type="button" onClick={() => handleDelete(plato)} className={adminTheme.destructiveButton}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Sin platos registrados"
                    description="Agrega el primer plato para este menu usando el boton superior."
                />
            )}
        </div>
    );
};
