import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Camera, MessageSquareText, Plus, Star, Store, UserRound, X } from "lucide-react";
import { EmptyState, FormField } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { adminTheme } from "../../../constants/theme";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { useReviewStore } from "../store/useReviewStore";

const formatDate = (date) => {
    if (!date) return "Reciente";
    return new Date(date).toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getAuthorName = (user) => {
    if (!user || typeof user === "string") return user || "Anonimo";
    return [user.nombre || user.name, user.apellido || user.surname].filter(Boolean).join(" ") || user.username || "Anonimo";
};

export const ReviewsPage = () => {
    const { reviews, loading, fetchReviews, createReview: storeCreate } = useReviewStore();
    const [restaurants, setRestaurants] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const role = useAuthStore((state) => state.user?.role);
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm();

    const photoFile = useWatch({ control, name: "photo" });
    const previewUrl = useMemo(() => {
        if (!photoFile || !photoFile.length) return null;
        return URL.createObjectURL(photoFile[0]);
    }, [photoFile]);

    const [filters, setFilters] = useState({
        restaurante: "",
        calificacion: "",
    });

    const fetchRestaurants = async () => {
        try {
            const { data } = await getRestaurants();
            setRestaurants(data?.data || data?.restaurantes || data || []);
        } catch {
            showError("No se pudieron cargar los restaurantes");
        }
    };

    useEffect(() => {
        fetchReviews(filters);
    }, [fetchReviews, filters]);

    useEffect(() => {
        queueMicrotask(() => {
            fetchRestaurants();
        });
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const onSubmit = async (values) => {
        try {
            setModalLoading(true);
            let payload;
            if (values.photo?.length) {
                payload = new FormData();
                payload.append("comentario", values.comment);
                payload.append("calificacion", values.rating);
                payload.append("restaurante", values.restaurantId);
                payload.append("fotoResena", values.photo[0]);
            } else {
                payload = {
                    comentario: values.comment,
                    calificacion: Number(values.rating),
                    restaurante: values.restaurantId,
                };
            }
            await storeCreate(payload);
            showSuccess("Resena registrada");
            reset();
            setOpenModal(false);
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "No se pudo guardar la resena";
            const detailed = resp?.errors && resp.errors.length ? resp.errors[0].message : null;
            showError(detailed || message);
        } finally {
            setModalLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const avgScore = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((acc, item) => acc + Number(item?.calificacion || 0), 0);
        return Number((total / reviews.length).toFixed(1));
    }, [reviews]);

    const totalWithPhoto = useMemo(
        () => reviews.filter((review) => Boolean(review?.fotoResena)).length,
        [reviews]
    );

    const closeModal = () => {
        setOpenModal(false);
        reset();
    };

    return (
        <div className="space-y-6">
            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="admin-kicker">Voz del cliente</p>
                        <h1 className={adminTheme.pageTitle}>Resenas</h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Administra comentarios, calificaciones y feedback por restaurante.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[28rem]">
                        <MetricCard label="Total" value={reviews.length} className="bg-slate-950 text-amber-400" />
                        <MetricCard label="Promedio" value={avgScore || "0.0"} className="bg-amber-50 text-amber-800" />
                        <MetricCard label="Con foto" value={totalWithPhoto} className="bg-slate-50 text-slate-900" />
                    </div>
                </div>
            </section>

            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 gap-4 md:grid-cols-[1fr_14rem]">
                        <div>
                            <label className={adminTheme.label}>Restaurante</label>
                            <select
                                name="restaurante"
                                value={filters.restaurante}
                                onChange={handleFilterChange}
                                className={`mt-2 w-full ${adminTheme.select}`}
                            >
                                <option value="">Todos los restaurantes</option>
                                {restaurants.map((r) => (
                                    <option key={r._id || r.id} value={r._id || r.id}>
                                        {r.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={adminTheme.label}>Calificacion</label>
                            <select
                                name="calificacion"
                                value={filters.calificacion}
                                onChange={handleFilterChange}
                                className={`mt-2 w-full ${adminTheme.select}`}
                            >
                                <option value="">Todas</option>
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                        {n} {n === 1 ? "estrella" : "estrellas"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {role === "USER_ROLE" && (
                        <button onClick={() => setOpenModal(true)} className={`${adminTheme.primaryButton} h-12 w-full gap-2 lg:w-auto`}>
                            <Plus size={16} />
                            Agregar resena
                        </button>
                    )}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-[18rem_1fr]">
                <div className="admin-card rounded-2xl p-6">
                    <p className="admin-kicker">Resumen</p>
                    <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8">
                        <span className="text-5xl font-black text-slate-950">{avgScore || "0.0"}</span>
                        <div className="mt-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                    key={n}
                                    size={18}
                                    className={n <= Math.round(avgScore) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                />
                            ))}
                        </div>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Puntuacion promedio</p>
                    </div>
                </div>

                <div className="admin-card rounded-2xl p-6">
                    <p className="admin-kicker">Lectura rapida</p>
                    <h2 className={`${adminTheme.sectionTitle} mt-2`}>Calidad percibida</h2>
                    <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
                        Usa los filtros para revisar el rendimiento de cada sede y detectar patrones en la experiencia de los clientes.
                    </p>
                </div>
            </section>

            {openModal && role === "USER_ROLE" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Voz del cliente</p>
                                <h3 className="mt-2 text-xl font-black uppercase tracking-tight">Nueva resena</h3>
                                <p className="mt-1 text-sm font-medium text-slate-400">Comparte una calificacion para un restaurante.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[76vh] space-y-4 overflow-y-auto p-6">
                            <FormField label="Restaurante" error={errors.restaurantId?.message}>
                                <select
                                    {...register("restaurantId", { required: "El restaurante es obligatorio" })}
                                    className={`w-full ${adminTheme.select}`}
                                >
                                    <option value="">Selecciona un restaurante</option>
                                    {restaurants.map((r) => (
                                        <option key={r._id || r.id} value={r._id || r.id}>
                                            {r.nombre}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Calificacion" error={errors.rating?.message}>
                                <select
                                    {...register("rating", { required: "La calificacion es obligatoria" })}
                                    className={`w-full ${adminTheme.select}`}
                                >
                                    <option value="">Selecciona</option>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <option key={value} value={value}>
                                            {value}/5
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Comentario" error={errors.comment?.message}>
                                <textarea
                                    {...register("comment", { required: "El comentario es obligatorio" })}
                                    rows={4}
                                    className={`w-full resize-none ${adminTheme.input}`}
                                    placeholder="Escribe tu opinion del restaurante..."
                                />
                            </FormField>

                            <FormField label="Imagen (opcional)">
                                <div className="flex flex-col gap-3">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-500 transition hover:border-amber-500/40 hover:bg-amber-50">
                                        <Camera size={18} className="text-amber-600" />
                                        Adjuntar imagen
                                        <input type="file" accept="image/*" {...register("photo")} className="sr-only" />
                                    </label>
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Preview resena"
                                            className="h-44 w-full rounded-2xl border border-slate-200 object-cover"
                                        />
                                    )}
                                </div>
                            </FormField>

                            <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                                <button type="submit" disabled={modalLoading} className={`${adminTheme.primaryButton} w-full`}>
                                    {modalLoading ? "Guardando..." : "Guardar resena"}
                                </button>
                                <button type="button" onClick={closeModal} className={`${adminTheme.neutralButton} w-full`}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]" />
                    ))}
                </div>
            ) : reviews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {reviews.map((review) => {
                        const rating = Number(review?.calificacion || 0);
                        return (
                            <article key={review?._id || review?.id} className="admin-card rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-lg shadow-slate-900/10">
                                            <MessageSquareText size={22} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate text-base font-black text-slate-950">
                                                    {review?.restaurante?.nombre || review?.restaurante || "Restaurante"}
                                                </h3>
                                                <span className="rounded-full border border-amber-500/30 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                                                    Verificado
                                                </span>
                                            </div>
                                            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                <UserRound size={13} />
                                                {getAuthorName(review?.usuario)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={15}
                                                className={rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {review?.fotoResena && (
                                    <img
                                        src={review.fotoResena}
                                        alt="Resena"
                                        className="mt-5 h-48 w-full rounded-2xl border border-slate-200 object-cover"
                                    />
                                )}

                                <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
                                    {review?.comentario || "Excelente servicio y comida de calidad."}
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                    <span className="inline-flex items-center gap-2">
                                        <Store size={14} />
                                        Feedback
                                    </span>
                                    <span>{formatDate(review?.createdAt)}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    title="Sin resenas"
                    description={role === "USER_ROLE" ? "Agrega la primera resena usando el boton superior." : "Aun no hay resenas registradas."}
                />
            )}
        </div>
    );
};

const MetricCard = ({ label, value, className }) => (
    <div className={`rounded-2xl border border-slate-200 p-4 ${className}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
        <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
);
