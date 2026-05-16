import { useEffect, useMemo, useState } from "react";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { getMenus } from "../../../shared/api";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { DishForm } from "../components/DishForm.jsx";
import { usePlatoStore } from "../store/usePlatoStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useInventoryStore } from "../../inventory/store/useInventoryStore";

const typeLabels = {
    ENTRADA: "Entrada",
    PLATO_FUERTE: "Plato fuerte",
    POSTRE: "Postre",
    BEBIDA: "Bebida",
};

const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
        return src;
    }
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

const formatIngredientLabel = (ingredient) => {
    if (!ingredient) return "";
    if (typeof ingredient === "string") return ingredient;

    const name = ingredient?.itemInventario?.nombreItem || ingredient?.itemInventario?.nombre || ingredient?.itemInventario || ingredient?.nombreItem || ingredient?.nombre || "";
    const amount = ingredient?.cantidad;
    if (name && amount != null && amount !== "") {
        return `${name} x${amount}`;
    }
    return name || String(amount || "");
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

    const { inventarios, fetchInventarios } = useInventoryStore();

    useEffect(() => {
        fetchInventarios();
    }, [fetchInventarios]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await fetchRestaurants();
            } catch {
                showError("No se pudieron cargar los restaurantes");
            }
        };
        loadInitialData();
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
                return;
            }
            try {
                setMenuLoading(true);
                const { data } = await getMenus({ restaurante: selectedRestaurant });
                const loadedMenus = data?.data || data?.menus || data || [];
                setMenus(loadedMenus);
                if (loadedMenus.length) {
                    setSelectedMenu(loadedMenus[0]._id || loadedMenus[0].id);
                } else {
                    setSelectedMenu("");
                }
            } catch {
                showError("No se pudieron cargar los menús");
            } finally {
                setMenuLoading(false);
            }
        };

        loadMenus();
    }, [selectedRestaurant]);

    useEffect(() => {
        if (!selectedMenu) return;
        fetchPlatos(selectedMenu).catch(() => {
            showError("No se pudieron cargar los platos para el menú seleccionado");
        });
    }, [selectedMenu]);

    const selectedMenuData = useMemo(
        () => menus.find((menu) => (menu._id || menu.id) === selectedMenu),
        [menus, selectedMenu]
    );

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
            
            if (values.ingredients) {
                payload.append("ingredientes", values.ingredients);
            }
            if (values.photo?.length) {
                payload.append("fotosPlato", values.photo[0]);
            }

            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Plato actualizado");
            } else {
                await storeCreate(payload);
                showSuccess("Plato creado");
            }

            setOpenModal(false);
            setEditing(null);
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
        if (!confirm("¿Eliminar este plato?")) return;
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
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Gestión de platos</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Crea, edita y administra platos por menú con la misma experiencia visual del resto.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <select
                                value={selectedRestaurant}
                                onChange={(event) => setSelectedRestaurant(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none"
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
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none"
                                disabled={!selectedRestaurant || menuLoading}
                            >
                                <option value="">{menuLoading ? "Cargando..." : "Selecciona un menú"}</option>
                                {menus.map((menu) => (
                                    <option key={menu._id || menu.id} value={menu._id || menu.id}>
                                        {menu.nombreMenu || menu.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setEditing(null);
                                setOpenModal(true);
                            }}
                            className="w-full lg:w-auto rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95 text-sm"
                        >
                            + Agregar plato
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editing ? "Editar plato" : "Nuevo plato"}
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
                                isEditing={!!editing}
                                isLoading={modalLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {menuLoading ? (
                <div className="text-center py-12">
                    <p className="text-slate-600">Cargando menús...</p>
                </div>
            ) : !menus.length ? (
                <EmptyState title="Sin menús disponibles" description="Crea un menú primero para agregar platos." />
            ) : !selectedMenu ? (
                <EmptyState title="Selecciona un menú" description="Elige un menú para ver y administrar sus platos." />
            ) : loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-600">Cargando platos...</p>
                </div>
            ) : platos.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {platos.map((plato) => (
                        <Card key={plato._id || plato.id} className="transition hover:-translate-y-1 hover:shadow-md">
                            {plato?.fotosPlato ? (
                                <img
                                    src={resolveImageSrc(plato.fotosPlato)}
                                    alt={plato.nombrePlato || "Plato"}
                                    className="mb-3 h-40 w-full rounded-xl object-cover bg-slate-100"
                                />
                            ) : (
                                <div className="mb-3 h-40 w-full rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
                            )}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{plato.nombrePlato}</h3>
                                    <p className="mt-1 text-sm text-slate-600">{typeLabels[plato.tipoPlato] || "Tipo desconocido"}</p>
                                </div>
                                <span className="text-lg font-bold text-orange-600">Q{plato.precio}</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-600">{plato.descripcionPlato || "Sin descripción"}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <BadgeEstado value={plato.menu?.nombreMenu || selectedMenuData?.nombreMenu || "Menú"} />
                                {parseIngredients(plato.ingredientes).map((ingredient, idx) => {
                                    // Búsqueda del nombre del ingrediente en el inventario global
                                    const idToSearch = ingredient?.itemInventario?._id || ingredient?.itemInventario?.id || ingredient?.itemInventario || ingredient;
                                    const found = inventarios.find(i => i._id === idToSearch || i.id === idToSearch);
                                    
                                    const name = found?.nombreItem || ingredient?.itemInventario?.nombreItem || ingredient?.itemInventario?.nombre || idToSearch;
                                    const amount = ingredient?.cantidad;
                                    
                                    const label = (name && amount != null && amount !== "") ? `${name} x${amount}` : name;

                                    return label ? (
                                        <span key={`${plato._id || plato.id}-ingredient-${idx}`} className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                                            {label}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(plato)}
                                    className="rounded-xl border border-orange-100 bg-orange-50 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(plato)}
                                    className="rounded-xl border border-rose-100 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Sin platos registrados"
                    description="Agrega el primer plato para este menú usando el botón superior." 
                />
            )}
        </div>
    );
};
