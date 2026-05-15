import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/store/authStore";
import { useReservationStore } from "../store/useReservationStore";
import { 
    CalendarDays, 
    ChevronRight, 
    Users, 
    MapPin, 
    Clock, 
    XCircle, 
    Plus,
    Utensils,
    Calendar,
    ArrowRight
} from "lucide-react";
import resHero from "../../../assets/images/Restaurante5.jpg";

const filters = ["Todas", "Confirmada", "Pendiente", "Cancelada"];

const statusMap = {
    CONFIRMADA: "Confirmada",
    PENDIENTE: "Pendiente",
    CANCELADA: "Cancelada",
    COMPLETADA: "Completada",
};

const statusConfig = {
    Confirmada: {
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        label: "Confirmada"
    },
    Pendiente: {
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        label: "Pendiente"
    },
    Cancelada: {
        pill: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        label: "Cancelada"
    },
    Completada: {
        pill: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: "Completada"
    },
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
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta reservación?")) return;
        
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
        <div className="min-h-screen bg-slate-50">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-slate-950 mb-8">
                <div className="absolute inset-0">
                    <img
                        src={resHero}
                        alt="Reservations"
                        className="h-full w-full object-cover object-center opacity-30 mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
                </div>
                <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-orange-500 mb-4">Agenda Gastronómica</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                                Mis <span className="text-orange-500">Reservaciones</span>
                            </h1>
                            <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                                Revisa tus mesas apartadas y crea nuevas experiencias inolvidables para tus próximas visitas.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/home/restaurants")}
                            className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Nueva Reservación
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
                {/* Filters */}
                <div className="mb-8 overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex min-w-max gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={cx(
                                    "rounded-full border px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200",
                                    activeFilter === filter
                                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600 flex items-center gap-3">
                        <XCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <section className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-44 animate-pulse rounded-[2rem] bg-white border border-slate-100 shadow-sm" />
                        ))}
                    </section>
                ) : visibleReservations.length === 0 ? (
                    <section className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                            <Calendar size={36} className="text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Sin reservaciones</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                            Agenda una mesa y deja que el restaurante prepare tu experiencia antes de llegar.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/home/restaurants")}
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
                        >
                            Explorar Restaurantes
                            <ArrowRight size={16} strokeWidth={3} />
                        </button>
                    </section>
                ) : (
                    <section className="space-y-5">
                        {visibleReservations.map((reservation, index) => {
                            const id = reservation._id || reservation.id;
                            const status = normalizeStatus(reservation.estado);
                            const config = statusConfig[status] || statusConfig.Pendiente;
                            const canAct = status === "Pendiente" || status === "Confirmada";
                            const restaurantName = reservation.restaurante?.nombre || "Restaurante";
                            const tableNumber = reservation.mesa?.numeroMesa;
                            const guests = reservation.cantidadPersonas || reservation.mesa?.capacidad || 1;

                            return (
                                <article
                                    key={id}
                                    style={{ animation: "resIn .4s ease-out both", animationDelay: `${index * 60}ms` }}
                                    className="group overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <style>{`
                                        @keyframes resIn {
                                            from { opacity: 0; transform: translateY(16px); }
                                            to   { opacity: 1; transform: translateY(0); }
                                        }
                                    `}</style>
                                    
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex items-start gap-5">
                                                <div className={cx("h-16 w-1.5 rounded-full flex-shrink-0", config.dot)} />
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={cx("rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest", config.pill)}>
                                                            {config.label}
                                                        </span>
                                                        {tableNumber && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                                <Utensils size={10} />
                                                                Mesa {tableNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{restaurantName}</h2>
                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-slate-400">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                                            <CalendarDays size={14} className="text-orange-500" />
                                                            {formatReservationDate(reservation.fecha)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                                            <Clock size={14} className="text-orange-500" />
                                                            {formatReservationTime(reservation.fecha)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 rounded-3xl bg-slate-50 border border-slate-100 p-4 min-w-[140px]">
                                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm text-orange-500">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invitados</p>
                                                    <p className="text-xl font-black text-slate-900">{guests}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {canAct && (
                                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/reservaciones/modificar/${id}`)}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-95"
                                                >
                                                    Modificar
                                                    <ChevronRight size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(reservation)}
                                                    disabled={savingId === id}
                                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-6 py-3 text-xs font-bold uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-100 active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                                                >
                                                    <XCircle size={14} />
                                                    {savingId === id ? "Cancelando..." : "Cancelar"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
