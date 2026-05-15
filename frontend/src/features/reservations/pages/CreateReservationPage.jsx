import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../tables/store/useTableStore";
import { getRestaurantById } from "../../../shared/api";
import { 
    CalendarDays, Clock, User, Users, MapPin, 
    ChevronLeft, ChevronRight, Check, Sparkles, MessageSquare, Utensils, ArrowLeft,
    ShieldCheck, Save
} from "lucide-react";
import { showSuccess as toastSuccess, showError as toastError } from "../../../shared/utils/toast";

// Helper to generate 30‑minute intervals between two HH:MM strings
const generateTimeSlots = (start, end) => {
  const slots = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let hour = sh;
  let minute = sm;
  while (hour < eh || (hour === eh && minute <= em)) {
    const pad = (n) => String(n).padStart(2, "0");
    slots.push(`${pad(hour)}:${pad(minute)}`);
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }
  return slots;
};

const guestOptions = [1, 2, 3, 4, 5, 6, 7, "8+"];
const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const fullWeekDays = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const buildCalendarDays = (currentMonth) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
        ...Array.from({ length: startOffset }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
    ];
};

const cx = (...classes) => classes.filter(Boolean).join(" ");
const sectionWrapper = "pt-12 pb-16 border-b border-slate-100 last:border-0";
const sectionEyebrow = "text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-4 flex items-center gap-2";
const sectionTitle = "text-3xl font-black text-slate-950 tracking-tight mb-8";
const inputClass = "w-full border-b-2 border-slate-200 bg-transparent px-0 py-4 text-xl font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-amber-500";

export const CreateReservationPage = () => {
    const navigate = useNavigate();
    const { restaurantId, reservationId } = useParams();
    const { createReservation, updateReservation, fetchReservationById } = useReservationStore();
    const { restaurants, loading: loadingRestaurants, fetchRestaurants } = useRestaurantStore();
    const {
        restaurantTables,
        loading: loadingTables,
        fetchRestaurantTables,
        clearRestaurantTables,
    } = useTableStore();
    
    const today = useMemo(() => new Date(), []);
    const [clientName, setClientName] = useState("");
    const [guests, setGuests] = useState(2);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [selectedTable, setSelectedTable] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [lockedRestaurant, setLockedRestaurant] = useState(null);
    const isEdit = Boolean(reservationId);
    
    const isRestaurantLocked = Boolean(restaurantId);
    const reservationRestaurantId = restaurantId || selectedRestaurant;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchRestaurants().catch(() => {});
        
        if (isEdit) {
            setLoading(true);
            fetchReservationById(reservationId)
                .then((res) => {
                    if (res) {
                        setClientName(res.nombre || "");
                        setGuests(res.cantidadPersonas >= 8 ? "8+" : res.cantidadPersonas || 2);
                        setSelectedRestaurant(res.restaurante?._id || res.restaurante?.id || res.restaurante);
                        setSelectedTable(res.mesa?._id || res.mesa?.id || res.mesa);
                        setSpecialRequests(res.notas || "");
                        
                        if (res.fecha) {
                            const d = new Date(res.fecha);
                            setSelectedDate(toDateKey(d));
                            setSelectedTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
                            setCurrentMonth(d);
                        }
                    }
                    setLoading(false);
                })
                .catch(() => {
                    toastError("No se pudo cargar la reservación");
                    navigate("/reservaciones");
                });
        }
    }, [fetchRestaurants, isEdit, reservationId, fetchReservationById, navigate]);

    useEffect(() => {
        if (!restaurantId && !isEdit) return;
        const targetId = restaurantId || selectedRestaurant;
        if (!targetId) return;

        getRestaurantById(targetId)
            .then(({ data }) => setLockedRestaurant(data?.data || data?.restaurante || data || null))
            .catch(() => setLockedRestaurant(null));
    }, [restaurantId, isEdit, selectedRestaurant]);

    useEffect(() => {
        if (!reservationRestaurantId) {
            clearRestaurantTables();
            return;
        }
        fetchRestaurantTables(reservationRestaurantId).catch(() => {});
    }, [clearRestaurantTables, fetchRestaurantTables, reservationRestaurantId]);

    const selectedRestaurantData = lockedRestaurant || restaurants.find(
        (restaurant) => String(restaurant._id || restaurant.id) === String(reservationRestaurantId)
    ) || { nombre: lockedRestaurant?.nombre || (loading ? "Cargando..." : "Selecciona un restaurante") };

    const timeSlots = useMemo(() => {
        if (!selectedRestaurantData?.horario?.apertura || !selectedRestaurantData?.horario?.cierre) {
            return [];
        }
        return generateTimeSlots(selectedRestaurantData.horario.apertura, selectedRestaurantData.horario.cierre);
    }, [selectedRestaurantData?.horario]);
    
    const minDateKey = toDateKey(today);
    const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
    const shortWeekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    const errors = {
        clientName: submitted && !clientName.trim(),
        guests: submitted && !guests,
        selectedRestaurant: submitted && !reservationRestaurantId,
        selectedTable: submitted && !selectedTable,
        selectedDate: submitted && !selectedDate,
        selectedTime: submitted && !selectedTime,
    };

    const selectedTableData = restaurantTables.find(
        (table) => String(table._id || table.id) === String(selectedTable)
    );
    const capacityGuests = guests === "8+" ? 8 : Number(guests);

    const selectedDateLabel = selectedDate
        ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
        })
        : "Elige una fecha";

    const handleSubmit = async () => {
        setSubmitted(true);
        setSubmitError("");
        const tableId = selectedTableData?._id || selectedTableData?.id || selectedTable;
        if (!clientName.trim() || !guests || !reservationRestaurantId || !tableId || !selectedDate || !selectedTime) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        const payload = {
            restaurante: reservationRestaurantId,
            mesa: tableId,
            fecha: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
            cantidadPersonas: capacityGuests,
            notas: specialRequests,
            nombre: clientName, // Added to match store usage
        };

        try {
            if (isEdit) {
                await updateReservation(reservationId, payload);
                toastSuccess("Reservación actualizada con éxito");
            } else {
                await createReservation(payload);
            }
            setLoading(false);
            setShowSuccess(true);
        } catch (error) {
            setSubmitError(error.response?.data?.message || error.response?.data?.error || "Ocurrió un error al procesar la reservación");
            setLoading(false);
        }
    };

    const moveMonth = (direction) => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + direction, 1));

    if (loading && isEdit && !clientName) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Cargando reservación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans selection:bg-amber-200">
            <style>{`
                @keyframes reservationPop {
                    0% { transform: scale(.72); opacity: 0; }
                    70% { transform: scale(1.08); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes successRing {
                    0% { transform: scale(.75); opacity: .7; }
                    100% { transform: scale(1.45); opacity: 0; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* LADO IZQUIERDO */}
            <div className="flex-1 px-6 py-10 md:px-16 md:py-16 lg:px-24 xl:px-32 lg:w-[65%] overflow-y-auto no-scrollbar pb-32 lg:pb-16">
                
                <div className="flex items-center justify-between mb-16">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
                            <ArrowLeft size={14} />
                        </div>
                        Volver
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/reservaciones")}
                        className="flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                        <CalendarDays size={14} />
                        Mis reservas
                    </button>
                </div>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[2px] w-12 bg-amber-500" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-600">
                            {isEdit ? "Gestión de Reserva" : "Servicio Exclusivo"}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950 mb-6 leading-none">
                        {isEdit ? "Ajusta tu experiencia." : "Asegura tu lugar."}
                    </h1>
                    <p className="max-w-xl text-lg font-medium text-slate-500">
                        {isEdit 
                            ? "Cambia los detalles de tu reservación para que todo sea perfecto en tu próxima visita."
                            : isRestaurantLocked
                                ? `Estás a unos pasos de vivir una experiencia culinaria inigualable en ${selectedRestaurantData?.nombre || "nuestro restaurante"}.`
                                : "Reserva una experiencia tranquila, con servicio atento y tu mesa lista cuando llegues."}
                    </p>
                </header>

                <div className="max-w-3xl">
                    {/* Cliente */}
                    <div className={sectionWrapper}>
                        <p className={sectionEyebrow}><User size={14} /> Titular de la reserva</p>
                        <h2 className={sectionTitle}>¿A nombre de quién?</h2>
                        <div className="relative">
                            <input
                                value={clientName}
                                onChange={(event) => setClientName(event.target.value)}
                                placeholder="Ej. Alexander Pierce"
                                className={cx(inputClass, errors.clientName && "border-red-500 placeholder:text-red-300")}
                            />
                            {errors.clientName && <span className="absolute right-0 top-4 text-xs font-black text-red-500 uppercase tracking-widest">Requerido</span>}
                        </div>
                    </div>

                    {/* Restaurante (Only if not locked and not edit) */}
                    {!isRestaurantLocked && !isEdit && (
                        <div className={sectionWrapper}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className={sectionEyebrow}><MapPin size={14} /> Destino Gourmet</p>
                                    <h2 className={sectionTitle}>Elige el lugar</h2>
                                </div>
                                {loadingRestaurants && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Cargando...</span>}
                            </div>
                            
                            {restaurants.length ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {restaurants.map((restaurant) => {
                                        const id = restaurant._id || restaurant.id;
                                        const isSelected = selectedRestaurant === id;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRestaurant(id);
                                                    setSelectedTable("");
                                                }}
                                                className={cx(
                                                    "group relative overflow-hidden rounded-3xl border-2 p-6 text-left transition-all duration-300",
                                                    isSelected
                                                        ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-900/20"
                                                        : "border-slate-100 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md"
                                                )}
                                            >
                                                {isSelected && <Sparkles size={16} className="absolute right-4 top-4 text-amber-400" />}
                                                <p className="text-xl font-black tracking-tight mb-1">{restaurant.nombre || restaurant.name}</p>
                                                <p className={cx("text-sm font-bold", isSelected ? "text-white/60" : "text-slate-400")}>
                                                    {restaurant.categoria || "Restaurante premium"}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-slate-400 italic">No hay restaurantes disponibles.</p>
                            )}
                            {errors.selectedRestaurant && <p className="mt-4 text-xs font-black text-red-500 uppercase tracking-widest">Debes seleccionar un restaurante</p>}
                        </div>
                    )}

                    {/* Personas */}
                    <div className={sectionWrapper}>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                            <div>
                                <p className={sectionEyebrow}><Users size={14} /> Acompañantes</p>
                                <h2 className={sectionTitle}>Tamaño del grupo</h2>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-full p-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTable("");
                                        setGuests((value) => (value === "8+" ? 8 : Math.max(1, value - 1)));
                                    }}
                                    className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-950 hover:text-white active:scale-90"
                                >
                                    <span className="text-2xl font-black mb-1">-</span>
                                </button>
                                <span className="w-8 text-center text-2xl font-black text-slate-950">{guests}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedTable("");
                                        setGuests((value) => (value >= 8 || value === "8+" ? "8+" : value + 1));
                                    }}
                                    className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-950 hover:text-white active:scale-90"
                                >
                                    <span className="text-2xl font-black mb-1">+</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                            {guestOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTable("");
                                        setGuests(option);
                                    }}
                                    className={cx(
                                        "rounded-2xl py-4 text-base font-black transition-all duration-300",
                                        guests === option
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mesa */}
                    <div className={sectionWrapper}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className={sectionEyebrow}><Utensils size={14} /> Ubicación</p>
                                <h2 className={sectionTitle}>Mesa ideal</h2>
                            </div>
                            {loadingTables && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Buscando...</span>}
                        </div>
                        
                        {!reservationRestaurantId ? (
                            <p className="text-sm font-bold text-slate-400 italic">Selecciona un restaurante para visualizar las mesas.</p>
                        ) : restaurantTables.length ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {restaurantTables.map((table) => {
                                    const id = table._id || table.id;
                                    const capacity = Number(table.capacidad || 0);
                                    const isSelected = String(selectedTable) === String(id);
                                    const disabled = table.disponibilidad === false || capacity < capacityGuests;
                                    
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            disabled={disabled && !isSelected}
                                            onClick={() => setSelectedTable(id)}
                                            className={cx(
                                                "relative flex flex-col items-center justify-center rounded-3xl border-2 p-6 transition-all duration-300",
                                                isSelected
                                                    ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-900/20"
                                                    : "border-slate-100 bg-white text-slate-700 hover:border-slate-300",
                                                (disabled && !isSelected) && "cursor-not-allowed opacity-40 grayscale"
                                            )}
                                        >
                                            {isSelected && <Sparkles size={16} className="absolute right-3 top-3 text-amber-400" />}
                                            <p className="text-xl font-black mb-1">{table.numeroMesa || "S/N"}</p>
                                            <p className={cx("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-white/60" : "text-slate-400")}>
                                                {capacity} personas
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-slate-400 italic">No hay mesas registradas para este restaurante.</p>
                        )}
                        {errors.selectedTable && <p className="mt-4 text-xs font-black text-red-500 uppercase tracking-widest">Debes seleccionar una mesa</p>}
                    </div>

                    {/* Fecha */}
                    <div className={sectionWrapper}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className={sectionEyebrow}><CalendarDays size={14} /> El día</p>
                                <h2 className={`${sectionTitle} capitalize`}>{selectedDateLabel}</h2>
                            </div>
                            <div className="flex gap-2 bg-slate-50 p-1 rounded-full">
                                <button type="button" onClick={() => moveMonth(-1)} className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-950 hover:text-white active:scale-95"><ChevronLeft size={20} strokeWidth={3} /></button>
                                <button type="button" onClick={() => moveMonth(1)} className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-950 hover:text-white active:scale-95"><ChevronRight size={20} strokeWidth={3} /></button>
                            </div>
                        </div>
                        
                        <div className="mb-6 bg-transparent text-center text-sm font-black uppercase tracking-[0.4em] text-slate-900">
                            {monthNames[currentMonth.getMonth()]} <span className="text-slate-400">{currentMonth.getFullYear()}</span>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-3">
                            {shortWeekDays.map((day, index) => (
                                <div key={`${day}-${index}`} className="pb-4 text-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                                    {day}
                                </div>
                            ))}
                            {days.map((date, index) => {
                                const dateKey = date ? toDateKey(date) : "";
                                const isDisabled = dateKey && selectedRestaurantData?.horario?.diasAbierto && !selectedRestaurantData.horario.diasAbierto.includes(fullWeekDays[date.getDay()]);
                                const isSelected = selectedDate === dateKey;
                                const isPast = dateKey && dateKey < minDateKey && !isSelected;

                                return (
                                    <button
                                        key={dateKey || `empty-${index}`}
                                        type="button"
                                        disabled={!date || (isPast && !isSelected) || isDisabled}
                                        onClick={() => setSelectedDate(dateKey)}
                                        className={cx(
                                            "aspect-square rounded-full text-base font-black transition-all duration-300",
                                            !date && "pointer-events-none opacity-0",
                                            (isPast && !isSelected) && "cursor-not-allowed text-slate-300",
                                            isDisabled && "cursor-not-allowed text-slate-300",
                                            date && !(isPast && !isSelected) && !isDisabled && !isSelected && "bg-slate-50 text-slate-700 hover:bg-slate-200 hover:text-slate-950",
                                            isSelected && "bg-slate-950 text-white shadow-lg shadow-slate-900/30 scale-110"
                                        )}
                                    >
                                        {date?.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.selectedDate && <p className="mt-6 text-xs font-black text-red-500 uppercase tracking-widest text-center">Debes elegir una fecha</p>}
                    </div>

                    {/* Hora */}
                    <div className={sectionWrapper}>
                        <p className={sectionEyebrow}><Clock size={14} /> El momento</p>
                        <h2 className={sectionTitle}>Elige tu turno</h2>

                        {timeSlots.length ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedTime(slot)}
                                        className={cx(
                                            "rounded-2xl py-4 text-sm font-black transition-all duration-300",
                                            selectedTime === slot
                                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                                        )}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Horario no disponible para este restaurante.</p>
                        )}
                        {errors.selectedTime && <p className="mt-6 text-xs font-black text-red-500 uppercase tracking-widest text-center">Debes seleccionar una hora</p>}
                    </div>

                    {/* Detalles Especiales */}
                    <div className="pt-12 pb-8">
                        <p className={sectionEyebrow}><MessageSquare size={14} /> Opcional</p>
                        <h2 className={sectionTitle}>Detalles especiales</h2>
                        <textarea
                            value={specialRequests}
                            onChange={(event) => setSpecialRequests(event.target.value)}
                            placeholder="Alergias, aniversario, mesa junto a la ventana..."
                            rows={3}
                            className={cx(inputClass, "resize-none border-b-2")}
                        />
                    </div>
                </div>
            </div>

            {/* LADO DERECHO */}
            <div className="lg:w-[35%] bg-slate-950 text-white p-8 md:p-12 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto flex flex-col justify-between relative shadow-2xl shadow-slate-900 border-l border-slate-800 z-10">
                <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-slate-800/50 blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8 opacity-70">
                        <div className="h-1 w-1 rounded-full bg-amber-500" />
                        <div className="h-1 w-1 rounded-full bg-amber-500" />
                        <div className="h-1 w-1 rounded-full bg-amber-500" />
                    </div>
                    
                    <h3 className="text-4xl font-black tracking-tighter mb-12">
                        {isEdit ? "Edición" : "Resumen"}<br/>
                        <span className="text-slate-500">{isEdit ? "de cambios." : "de reserva."}</span>
                    </h3>

                    <div className="space-y-8 font-medium">
                        <div className="group">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Titular</p>
                            <p className="text-xl font-black truncate">{clientName || "—"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="group">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Fecha</p>
                                <p className="text-xl font-black capitalize">{selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}</p>
                            </div>
                            <div className="group">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Hora</p>
                                <p className="text-xl font-black">{selectedTime || "—"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="group">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ubicación</p>
                                <p className="text-xl font-black">{selectedTableData ? `Mesa ${selectedTableData.numeroMesa}` : "—"}</p>
                            </div>
                            <div className="group">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Invitados</p>
                                <p className="text-xl font-black">{guests} personas</p>
                            </div>
                        </div>
                        {specialRequests.trim() && (
                            <div className="group border-t border-white/10 pt-4 mt-4">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Detalles Especiales</p>
                                <p className="text-sm font-bold text-slate-300 italic break-words whitespace-pre-wrap">"{specialRequests}"</p>
                            </div>
                        )}
                        <div className="group border-t border-slate-800 pt-6 mt-6">
                            <p className="text-amber-500/70 text-[10px] font-black uppercase tracking-widest mb-2">Restaurante</p>
                            <p className="text-2xl font-black truncate">{selectedRestaurantData?.nombre || "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-16 lg:mt-24">
                    {submitError && (
                        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-bold text-red-400">
                            {submitError}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`group relative flex w-full items-center justify-between overflow-hidden rounded-full p-2 pr-6 transition-all duration-500 ${
                            loading 
                                ? "bg-amber-600/50 cursor-wait" 
                                : "bg-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`grid h-14 w-14 place-items-center rounded-full transition-all duration-500 bg-white/20 group-hover:rotate-12`}>
                                {loading ? (
                                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                ) : isEdit ? (
                                    <Save className="h-6 w-6 text-white" strokeWidth={3} />
                                ) : (
                                    <Check className="h-6 w-6 text-white" strokeWidth={3} />
                                )}
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                    {isEdit ? "Actualización" : "Paso Final"}
                                </span>
                                <span className="block text-sm font-black text-white uppercase tracking-widest">
                                    {isEdit ? "Guardar Cambios" : "Confirmar Reserva"}
                                </span>
                            </div>
                        </div>
                    </button>
                    
                    <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-6">
                        Transacción segura garantizada
                    </p>
                </div>
            </div>

            {/* Modal de Éxito */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
                    <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 p-10 text-center shadow-[0_0_80px_-20px_rgba(245,158,11,0.3)]">
                        <div className="mb-8 flex justify-center">
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 ring-8 ring-amber-500/10">
                                <ShieldCheck size={48} strokeWidth={4} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4">
                            {isEdit ? "¡Cambios guardados!" : "¡Reserva confirmada!"}
                        </h2>
                        <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-sm mx-auto">
                            {isEdit 
                                ? `Tu reservación en ${selectedRestaurantData?.nombre} ha sido actualizada correctamente.`
                                : `Tu reserva en ${selectedRestaurantData?.nombre} ha sido procesada exitosamente. Revisa tu ticket para los detalles.`}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/reservaciones")}
                            className="w-full bg-white text-slate-950 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-[0.98]"
                        >
                            Volver a mis reservas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateReservationPage;
