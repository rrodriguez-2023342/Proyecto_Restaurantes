import { useEffect, useState } from "react";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { RestaurantForm } from "../components/RestaurantForm.jsx";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { getUsersByRole } from "../../../shared/api/users";

const mapPayload = (values) => {
    const payload = new FormData();
    if (values.name) payload.append("nombre", values.name);
    if (values.description) payload.append("descripcion", values.description);
    if (values.category) payload.append("categoria", values.category);
    if (values.phone) payload.append("telefono", values.phone);
    if (values.street) payload.append("direccion.calle", values.street);
    if (values.city) payload.append("direccion.ciudad", values.city);
    payload.append("isActive", values.active === true || values.active === "true" ? "true" : "false");

    if (values.openingTime) {
        payload.append("horario.apertura", values.openingTime);
    }

    if (values.closingTime) {
        payload.append("horario.cierre", values.closingTime);
    }

    const days = Array.isArray(values.openDays)
        ? values.openDays
        : values.openDays
            ? [values.openDays]
            : [];
    days.forEach((day) => {
        if (day) payload.append("horario.diasAbierto", day);
    });

    if (values.photo?.length) {
        payload.append("fotos", values.photo[0]);
    }
    if (values.ownerId) {
        payload.append('dueno', values.ownerId);
    }

    return payload;
};

export const RestaurantsPage = () => {
    const { restaurants, loading, fetchRestaurants, createRestaurant: storeCreate, updateRestaurant: storeUpdate, deleteRestaurant: storeDelete } = useRestaurantStore();
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [owners, setOwners] = useState([]);
    const [showSpecs, setShowSpecs] = useState(null);

    useEffect(() => {
        fetchRestaurants();
        (async () => {
            try {
                const [ownerRes, adminRes] = await Promise.allSettled([
                    getUsersByRole('ADMIN_RESTAURANT_ROLE'),
                    getUsersByRole('ADMIN_ROLE')
                ]);
                let allOwners = [];
                if (ownerRes.status === 'fulfilled') allOwners = [...allOwners, ...(ownerRes.value.data || [])];
                if (adminRes.status === 'fulfilled') allOwners = [...allOwners, ...(adminRes.value.data || [])];

                const unique = Array.from(new Map(allOwners.map(item => [item.id || item._id, item])).values());
                setOwners(unique);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            const payload = mapPayload(values);
            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Restaurante actualizado");
            } else {
                await storeCreate(payload);
                showSuccess("Restaurante creado");
            }
            setOpenModal(false);
            setEditing(null);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo guardar el restaurante";
            const detailed = resp?.errors && resp.errors.length ? resp.errors[0].message : null;
            showError(detailed || message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (restaurant) => {
        if (!confirm("¿Eliminar este restaurante?")) return;
        try {
            await storeDelete(restaurant._id || restaurant.id);
            showSuccess("Restaurante eliminado");
        } catch (err) {
            showError("No se pudo eliminar el restaurante");
        }
    };

    const handleToggleStatus = async (restaurant) => {
        try {
            const nextState = !restaurant?.isActive;
            await storeUpdate(restaurant._id || restaurant.id, { isActive: nextState });
            showSuccess(nextState ? "Restaurante activado" : "Restaurante desactivado");
        } catch (err) {
            showError("No se pudo actualizar el estado");
        }
    };

    const getPreviewImage = (restaurant) => {
        const image = restaurant?.fotos;
        if (!image) return null;
        if (
            image.startsWith("http") ||
            image.startsWith("data:") ||
            image.startsWith("blob:")
        ) {
            return image;
        }
        const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
        return base ? `${base}${image}` : image;
    };

    const shortText = (value, max = 120) => {
        if (!value) return "-";
        const trimmed = String(value).trim();
        if (trimmed.length <= max) return trimmed;
        return `${trimmed.slice(0, max).trim()}...`;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Gestión de restaurantes</h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600">
                            Crea y administra restaurantes activos dentro de la plataforma.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setOpenModal(true);
                        }}
                        className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95 text-sm sm:text-base"
                    >
                        + Agregar nuevo
                    </button>
                </div>
            </div>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="rounded-3xl bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {editing ? "Editar restaurante" : "Nuevo restaurante"}
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
                            <RestaurantForm
                                defaultValues={editing}
                                onSubmit={handleSubmit}
                                isLoading={modalLoading}
                                owners={owners}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de Restaurantes */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-600">Cargando restaurantes...</p>
                </div>
            ) : restaurants.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {restaurants.map((restaurant) => (
                        <Card
                            key={restaurant?._id || restaurant?.id}
                            className="transition hover:-translate-y-1 hover:shadow-md"
                        >
                            {getPreviewImage(restaurant) ? (
                                <img
                                    src={getPreviewImage(restaurant)}
                                    alt={restaurant?.nombre || "Restaurante"}
                                    className="mb-3 h-40 w-full rounded-xl object-contain bg-slate-100"
                                />
                            ) : (
                                <div className="mb-3 h-40 w-full rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
                            )}
                            <h3 className="font-semibold text-slate-900">{restaurant?.nombre}</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                {shortText(restaurant?.descripcion, 80)}
                            </p>
                            <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(restaurant);
                                        setOpenModal(true);
                                    }}
                                    className="flex-1 rounded-xl border border-orange-100 bg-orange-50 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(restaurant)}
                                    className="flex-1 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    {restaurant?.isActive ? "Desactivar" : "Activar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(restaurant)}
                                    className="col-span-2 sm:flex-initial rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSpecs(restaurant)}
                                className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-sm"
                            >
                                Ver especificaciones
                            </button>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState title="Sin restaurantes" description="Crea el primer restaurante para comenzar" />
            )}

            {/* Specs Modal */}
            {showSpecs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Especificaciones</h3>
                            <button onClick={() => setShowSpecs(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-6">
                            <section>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">🕒 Horario de atención</h4>
                                <div className="rounded-2xl bg-orange-50 p-4 border border-orange-100">
                                    <p className="text-sm text-slate-700 font-semibold">
                                        {showSpecs.horario?.apertura} - {showSpecs.horario?.cierre}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {showSpecs.horario?.diasAbierto?.map(day => (
                                            <span key={day} className="text-[10px] bg-white border border-orange-200 px-2 py-0.5 rounded-full text-orange-600 font-medium">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">📍 Ubicación</h4>
                                <div className="rounded-2xl bg-blue-50 p-4 border border-blue-100">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        <span className="font-bold">Calle:</span> {showSpecs.direccion?.calle || "No especificada"}<br />
                                        <span className="font-bold">Ciudad:</span> {showSpecs.direccion?.ciudad || "No especificada"}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <button
                            onClick={() => setShowSpecs(null)}
                            className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
