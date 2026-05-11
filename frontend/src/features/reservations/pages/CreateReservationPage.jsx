import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../tables/store/useTableStore";
import { getRestaurantById } from "../../../shared/api";

const lunchSlots = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
const dinnerSlots = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const guestOptions = [1, 2, 3, 4, 5, 6, 7, "8+"];
const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];
const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

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

const cardClass = "rounded-3xl border bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-6";
const sectionEyebrow = "text-[10px] font-black uppercase tracking-[0.24em] text-orange-500";
const sectionTitle = "mt-1 text-xl font-black text-slate-950";
const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";
const emptyPanelClass = "rounded-2xl border border-slate-100 bg-slate-50 px-4 py-5 text-sm font-bold text-slate-500";

export const CreateReservationPage = () => {
    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const { createReservation } = useReservationStore();
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
    const isRestaurantLocked = Boolean(restaurantId);
    const reservationRestaurantId = restaurantId || selectedRestaurant;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchRestaurants().catch(() => {});
    }, [fetchRestaurants]);

    useEffect(() => {
        if (!restaurantId) return;

        getRestaurantById(restaurantId)
            .then(({ data }) => {
                setLockedRestaurant(data?.data || data?.restaurante || data || null);
            })
            .catch(() => {
                setLockedRestaurant(null);
            });
    }, [restaurantId]);

    useEffect(() => {
        if (!reservationRestaurantId) {
            clearRestaurantTables();
            return;
        }
        fetchRestaurantTables(reservationRestaurantId).catch(() => {});
    }, [clearRestaurantTables, fetchRestaurantTables, reservationRestaurantId]);

    const autoSelectedTable = useMemo(() => {
        const preferredCapacity = guests === "8+" ? 8 : Number(guests);
        return restaurantTables.find((table) => {
            const capacity = Number(table.capacidad || 0);
            const isAvailable = table.disponibilidad !== false;
            return isAvailable && capacity >= preferredCapacity;
        });
    }, [guests, restaurantTables]);

    const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
    const minDateKey = toDateKey(today);

    const errors = {
        clientName: submitted && !clientName.trim(),
        guests: submitted && !guests,
        selectedRestaurant: submitted && !reservationRestaurantId,
        selectedTable: submitted && !(selectedTable || autoSelectedTable),
        selectedDate: submitted && !selectedDate,
        selectedTime: submitted && !selectedTime,
    };

    const selectedRestaurantData = lockedRestaurant || restaurants.find(
        (restaurant) => (restaurant._id || restaurant.id) === reservationRestaurantId
    );
    const selectedTableData = restaurantTables.find(
        (table) => (table._id || table.id) === (selectedTable || autoSelectedTable?._id || autoSelectedTable?.id)
    ) || autoSelectedTable;
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
        const tableId = selectedTable || autoSelectedTable?._id || autoSelectedTable?.id;
        if (!clientName.trim() || !guests || !reservationRestaurantId || !tableId || !selectedDate || !selectedTime) return;

        setLoading(true);
        try {
            await createReservation({
                restaurante: reservationRestaurantId,
                mesa: tableId,
                fecha: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
                cantidadPersonas: capacityGuests,
                notas: specialRequests,
            });
            setLoading(false);
            setShowSuccess(true);
        } catch (error) {
            setSubmitError(error.response?.data?.message || error.response?.data?.error || "No se pudo crear la reservacion");
            setLoading(false);
        }
    };

    const moveMonth = (direction) => {
        setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + direction, 1));
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
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
            `}</style>

            <main className="mx-auto max-w-6xl">
                <header className="mb-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
                    <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.32em] text-orange-500">Mesa privada</p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                                Nueva Reservacion
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:mx-0">
                                {isRestaurantLocked
                                    ? `Reserva tu mesa en ${selectedRestaurantData?.nombre || "este restaurante"} sin volver a elegir el lugar.`
                                    : "Reserva una experiencia tranquila, con servicio atento y mesa lista cuando llegues."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/reservaciones")}
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 transition hover:border-orange-200 hover:bg-orange-50"
                        >
                            Mis reservas
                        </button>
                    </div>
                </header>

                <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
                    <div className="space-y-5">
                        <article className={cx(cardClass, errors.clientName ? "border-red-300" : "border-slate-100")}>
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className={sectionEyebrow}>Cliente</p>
                                    <h2 className={sectionTitle}>Datos de la mesa</h2>
                                </div>
                                {errors.clientName && <span className="text-xs font-bold text-red-500">Requerido</span>}
                            </div>
                            <input
                                value={clientName}
                                onChange={(event) => setClientName(event.target.value)}
                                placeholder="Nombre del cliente"
                                className={inputClass}
                            />
                        </article>

                        {isRestaurantLocked ? (
                            <article className={cx(cardClass, "border-orange-100")}>
                                <p className={sectionEyebrow}>Restaurante</p>
                                <div className="mt-2 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                                    <h2 className="text-xl font-black text-slate-950">
                                        {selectedRestaurantData?.nombre || "Restaurante seleccionado"}
                                    </h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                        {selectedRestaurantData?.categoria || "Estas reservando desde el restaurante elegido."}
                                    </p>
                                </div>
                            </article>
                        ) : (
                            <article className={cx(cardClass, errors.selectedRestaurant ? "border-red-300" : "border-slate-100")}>
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className={sectionEyebrow}>Restaurante</p>
                                        <h2 className={sectionTitle}>Elige el lugar</h2>
                                    </div>
                                    {loadingRestaurants && <span className="text-xs font-bold text-slate-500">Cargando...</span>}
                                </div>
                                {restaurants.length ? (
                                    <div className="grid gap-2 sm:grid-cols-2">
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
                                                        "rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.99]",
                                                        isSelected
                                                            ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                                            : "border-slate-100 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50"
                                                    )}
                                                >
                                                    <p className="text-sm font-black">{restaurant.nombre || restaurant.name}</p>
                                                    <p className={cx("mt-1 text-xs", isSelected ? "text-white/75" : "text-slate-500")}>
                                                        {restaurant.categoria || "Restaurante premium"}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className={emptyPanelClass}>
                                        No hay restaurantes disponibles desde la base de datos.
                                    </p>
                                )}
                            </article>
                        )}

                        <article className={cx(cardClass, errors.guests ? "border-red-300" : "border-slate-100")}>
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className={sectionEyebrow}>Personas</p>
                                    <h2 className={sectionTitle}>Tamano del grupo</h2>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedTable("");
                                            setGuests((value) => (value === "8+" ? 8 : Math.max(1, value - 1)));
                                        }}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl font-black text-orange-500 shadow-sm transition hover:bg-orange-500 hover:text-white"
                                    >
                                        -
                                    </button>
                                    <span className="min-w-8 text-center text-sm font-black text-slate-900">{guests}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedTable("");
                                            setGuests((value) => (value >= 8 || value === "8+" ? "8+" : value + 1));
                                        }}
                                        className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl font-black text-orange-500 shadow-sm transition hover:bg-orange-500 hover:text-white"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                                {guestOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTable("");
                                            setGuests(option);
                                        }}
                                        className={cx(
                                            "rounded-2xl border py-3 text-sm font-black transition duration-200 active:scale-95",
                                            guests === option
                                                ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                                : "border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </article>

                        <article className={cx(cardClass, errors.selectedTable ? "border-red-300" : "border-slate-100")}>
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className={sectionEyebrow}>Mesa</p>
                                    <h2 className={sectionTitle}>Mesa compatible</h2>
                                </div>
                                {loadingTables && <span className="text-xs font-bold text-slate-500">Buscando...</span>}
                            </div>
                            {!reservationRestaurantId ? (
                                <p className={emptyPanelClass}>
                                    Selecciona un restaurante para cargar mesas reales.
                                </p>
                            ) : restaurantTables.length ? (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {restaurantTables.map((table) => {
                                        const id = table._id || table.id;
                                        const capacity = Number(table.capacidad || 0);
                                        const disabled = table.disponibilidad === false || capacity < capacityGuests;
                                        const isSelected = selectedTable === id;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => setSelectedTable(id)}
                                                className={cx(
                                                    "rounded-2xl border p-4 text-left transition duration-200",
                                                    isSelected
                                                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                                        : "border-slate-100 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-orange-50",
                                                    disabled && "cursor-not-allowed opacity-40 hover:border-slate-100 hover:bg-slate-50"
                                                )}
                                            >
                                                <p className="text-sm font-black">Mesa {table.numeroMesa || "S/N"}</p>
                                                <p className={cx("mt-1 text-xs", isSelected ? "text-white/75" : "text-slate-500")}>
                                                    {capacity} personas
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className={emptyPanelClass}>
                                    No hay mesas registradas para este restaurante.
                                </p>
                            )}
                        </article>

                        <article className={cx(cardClass, errors.selectedDate ? "border-red-300" : "border-slate-100")}>
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <p className={sectionEyebrow}>Fecha</p>
                                    <h2 className={sectionTitle}>{selectedDateLabel}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => moveMonth(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-slate-50 text-lg font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50">{"<"}</button>
                                    <button type="button" onClick={() => moveMonth(1)} className="grid h-10 w-10 place-items-center rounded-full border border-slate-100 bg-slate-50 text-lg font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50">{">"}</button>
                                </div>
                            </div>
                            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-sm font-black uppercase tracking-[0.2em] text-slate-600">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {weekDays.map((day, index) => (
                                    <div key={`${day}-${index}`} className="py-2 text-center text-[10px] font-black text-slate-400">
                                        {day}
                                    </div>
                                ))}
                                {days.map((date, index) => {
                                    const dateKey = date ? toDateKey(date) : "";
                                    const isPast = dateKey && dateKey < minDateKey;
                                    const isSelected = selectedDate === dateKey;

                                    return (
                                        <button
                                            key={dateKey || `empty-${index}`}
                                            type="button"
                                            disabled={!date || isPast}
                                            onClick={() => setSelectedDate(dateKey)}
                                            className={cx(
                                                "aspect-square rounded-2xl text-sm font-black transition duration-200",
                                                !date && "pointer-events-none opacity-0",
                                                isPast && "cursor-not-allowed text-slate-300",
                                                date && !isPast && !isSelected && "border border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50",
                                                isSelected && "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                            )}
                                        >
                                            {date?.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </article>
                    </div>

                    <aside className="space-y-5">
                        <article className={cx(cardClass, errors.selectedTime ? "border-red-300" : "border-slate-100")}>
                            <p className={sectionEyebrow}>Hora</p>
                            <h2 className={sectionTitle}>Elige tu turno</h2>

                            {[
                                ["Almuerzo", lunchSlots],
                                ["Cena", dinnerSlots],
                            ].map(([label, slots]) => (
                                <div key={label} className="mt-6">
                                    <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedTime(slot)}
                                                className={cx(
                                                    "rounded-full border px-4 py-3 text-sm font-black transition duration-200 active:scale-95",
                                                    selectedTime === slot
                                                        ? "border-orange-500 bg-slate-950 text-white shadow-lg shadow-slate-200 ring-2 ring-orange-200"
                                                        : "border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200 hover:bg-orange-50"
                                                )}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </article>

                        <article className={cx(cardClass, "border-slate-100")}>
                            <p className={sectionEyebrow}>Solicitudes</p>
                            <h2 className={sectionTitle}>Detalles especiales</h2>
                            <textarea
                                value={specialRequests}
                                onChange={(event) => setSpecialRequests(event.target.value)}
                                placeholder="Alergias, aniversario, mesa junto a la ventana..."
                                rows={5}
                                className="mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                            />
                        </article>

                        <article className="rounded-3xl border border-orange-100 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-6">
                            <p className={sectionEyebrow}>Resumen</p>
                            <div className="mt-5 space-y-4 text-sm">
                                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">Cliente</span>
                                    <span className="font-black text-slate-950">{clientName || "Pendiente"}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">Personas</span>
                                    <span className="font-black text-slate-950">{guests}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">Restaurante</span>
                                    <span className="text-right font-black text-slate-950">{selectedRestaurantData?.nombre || "Pendiente"}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">Mesa</span>
                                    <span className="font-black text-slate-950">{selectedTableData ? `Mesa ${selectedTableData.numeroMesa}` : "Pendiente"}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                    <span className="text-slate-500">Fecha</span>
                                    <span className="text-right font-black text-slate-950">{selectedDateLabel}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Hora</span>
                                    <span className="font-black text-slate-950">{selectedTime || "Pendiente"}</span>
                                </div>
                            </div>
                            {submitError && (
                                <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                                    {submitError}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-orange-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
                            >
                                {loading ? "Confirmando..." : "Confirmar Reservacion"}
                            </button>
                        </article>
                    </aside>
                </section>
            </main>

            {showSuccess && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-2xl shadow-slate-950/30">
                        <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center">
                            <span className="absolute h-20 w-20 rounded-full bg-orange-200" style={{ animation: "successRing 1s ease-out infinite" }} />
                            <div className="grid h-20 w-20 place-items-center rounded-full bg-orange-500 text-4xl font-black text-white" style={{ animation: "reservationPop .55s ease-out both" }}>
                                OK
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-950">Reservacion confirmada</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Te esperamos {selectedDateLabel} a las {selectedTime}. Tu mesa queda preparada.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/reservaciones")}
                            className="mt-7 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400"
                        >
                            Ver mis reservaciones
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateReservationPage;
