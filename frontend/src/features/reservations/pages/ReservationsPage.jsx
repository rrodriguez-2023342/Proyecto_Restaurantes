import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import { useReservationStore } from "../store/useReservationStore";

const filters = ["Todas", "Confirmada", "Pendiente", "Cancelada"];

const statusMap = {
    CONFIRMADA: "Confirmada",
    PENDIENTE: "Pendiente",
    CANCELADA: "Cancelada",
    COMPLETADA: "Completada",
};

const statusStyles = {
    Confirmada: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Pendiente: "border-amber-200 bg-amber-50 text-amber-700",
    Cancelada: "border-red-200 bg-red-50 text-red-600",
    Completada: "border-blue-200 bg-blue-50 text-blue-700",
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

const normalizeStatus = (status) => statusMap[status] || status || "Pendiente";

const formatReservationDate = (date) =>
    new Date(date).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

const formatReservationTime = (date) =>
    new Date(date).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });

export const ReservationsPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const {
        userReservations,
        loading,
        error,
        fetchUserReservations,
        deleteReservation,
    } = useReservationStore();
    const [activeFilter, setActiveFilter] = useState("Todas");
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        if (user?.id || user?._id) {
            fetchUserReservations(user.id || user._id).catch(() => {});
        }
    }, [fetchUserReservations, user?.id, user?._id]);

    const visibleReservations = useMemo(() => {
        const upcoming = [...userReservations].sort(
            (a, b) => new Date(a.fecha || a.date) - new Date(b.fecha || b.date)
        );
        if (activeFilter === "Todas") return upcoming;
        return upcoming.filter((reservation) => normalizeStatus(reservation.estado) === activeFilter);
    }, [activeFilter, userReservations]);

    const handleCancel = async (reservation) => {
        const id = reservation._id || reservation.id;
        setSavingId(id);
        try {
            await deleteReservation(id);
            if (user?.id || user?._id) {
                await fetchUserReservations(user.id || user._id);
            }
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-5xl">
                <header className="mb-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
                    <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Agenda</p>
                            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                Mis Reservaciones
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:mx-0">
                                Revisa tus mesas apartadas y crea nuevas reservaciones para tus proximas visitas.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/home/restaurants")}
                            className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 active:scale-95"
                        >
                            Elegir restaurante
                        </button>
                    </div>
                </header>

                <section className="mb-7 overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={cx(
                                    "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition",
                                    activeFilter === filter
                                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                        : "border-slate-100 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </section>

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <section className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </section>
                ) : visibleReservations.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center shadow-xl shadow-slate-200/60">
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange-50 text-4xl font-black text-orange-500">
                            --
                        </div>
                        <h2 className="mt-6 text-2xl font-black text-slate-950">No hay reservaciones</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            Agenda una mesa y deja que el restaurante prepare tu experiencia antes de llegar.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/home/restaurants")}
                            className="mt-7 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400"
                        >
                            Explorar restaurantes
                        </button>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {visibleReservations.map((reservation, index) => {
                            const id = reservation._id || reservation.id;
                            const status = normalizeStatus(reservation.estado);
                            const canAct = status === "Pendiente" || status === "Confirmada";
                            const restaurantName = reservation.restaurante?.nombre || "Restaurante";
                            const tableNumber = reservation.mesa?.numeroMesa;
                            const guests = reservation.cantidadPersonas || reservation.mesa?.capacidad || 1;

                            return (
                                <article
                                    key={id}
                                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:border-orange-200 sm:p-6"
                                    style={{ animation: "reservationCard .45s ease-out both", animationDelay: `${index * 80}ms` }}
                                >
                                    <style>{`
                                        @keyframes reservationCard {
                                            from { opacity: 0; transform: translateY(14px) scale(.98); }
                                            to { opacity: 1; transform: translateY(0) scale(1); }
                                        }
                                    `}</style>
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span className={cx("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]", statusStyles[status])}>
                                                    {status}
                                                </span>
                                                {tableNumber && (
                                                    <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                        Mesa {tableNumber}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-950">{restaurantName}</h2>
                                            <p className="mt-2 text-sm font-semibold capitalize text-slate-500">
                                                {formatReservationDate(reservation.fecha)} - {formatReservationTime(reservation.fecha)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                            <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-sm font-black text-orange-500">
                                                {guests}
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personas</p>
                                                <p className="text-lg font-black text-slate-950">{guests}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {canAct && (
                                        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                                            <button
                                                type="button"
                                                className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50"
                                            >
                                                Modificar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCancel(reservation)}
                                                disabled={savingId === id}
                                                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                {savingId === id ? "Cancelando..." : "Cancelar"}
                                            </button>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
};

export default ReservationsPage;
