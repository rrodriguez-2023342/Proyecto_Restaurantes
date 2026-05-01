import { useEffect, useMemo } from "react";
import { Spinner } from "@material-tailwind/react";
import { useTableStore } from "../../tables/store/useTableStore";

export const ReservationCalendar = ({
    restaurantId,
    restaurant,
    onSelectDate,
    onSelectTime,
    onSelectTable,
    selectedDate,
    selectedTime,
    selectedTable,
}) => {
    const {
        restaurantTables,
        fetchRestaurantTables,
        clearRestaurantTables,
        loading,
    } = useTableStore();
    const normalizeDay = (day) =>
        day
            ?.replace(/Ã¡/g, "a")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    const dayNames = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const openDays = useMemo(() => {
        return new Set((restaurant?.horario?.diasAbierto || []).map(normalizeDay));
    }, [restaurant?.horario?.diasAbierto]);
    const isOpenDay = (date) => {
        if (openDays.size === 0) return true;
        return openDays.has(normalizeDay(dayNames[date.getDay()]));
    };
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };
    const availableTimes = useMemo(() => {
        const times = [];
        const openingTime = restaurant?.horario?.apertura || "11:00";
        const closingTime = restaurant?.horario?.cierre || "23:00";
        const openingMinutes = timeToMinutes(openingTime);
        const closingMinutes = timeToMinutes(closingTime);

        for (let minutes = openingMinutes; minutes < closingMinutes; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            times.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        }

        return times;
    }, [restaurant?.horario?.apertura, restaurant?.horario?.cierre]);

    const availableTables = useMemo(() => {
        return restaurantTables.filter((table) => table.disponibilidad);
    }, [restaurantTables]);

    useEffect(() => {
        if (restaurantId) {
            fetchRestaurantTables(restaurantId);
        } else {
            clearRestaurantTables();
        }
    }, [clearRestaurantTables, fetchRestaurantTables, restaurantId]);

    const getDaysOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (day) => {
        const currentMonth = new Date();
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        onSelectDate(formatDate(date));
    };

    const renderCalendar = () => {
        const today = new Date();
        const currentMonth = new Date();
        const daysInMonth = getDaysOfMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((day, dayIdx) => {
                    if (!day) {
                        return (
                            <div
                                key={`empty-${dayIdx}`}
                                className="aspect-square rounded bg-slate-50"
                            />
                        );
                    }

                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateString = formatDate(date);
                    const isSelected = selectedDate === dateString;
                    const isPast = day < today.getDate();
                    const isClosed = !isOpenDay(date);
                    const isDisabled = isPast || isClosed;

                    return (
                        <button
                            key={day}
                            onClick={() => !isDisabled && handleDateClick(day)}
                            disabled={isDisabled}
                            className={`
                                aspect-square rounded font-medium text-sm transition
                                ${
                                    isDisabled
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : isSelected
                                        ? "bg-amber-500 text-white hover:bg-amber-600"
                                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        ));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Elige una fecha
                    </h3>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                                <div
                                    key={d}
                                    className="text-center text-xs font-semibold text-slate-600 py-2"
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        Selecciona hora
                    </h3>
                    <div className="bg-white rounded-lg border border-slate-200 p-3 max-h-64 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => onSelectTime(time)}
                                    disabled={!selectedDate}
                                    className={`
                                        py-2 px-2 rounded text-sm font-medium transition
                                        ${
                                            selectedTime === time
                                                ? "bg-amber-500 text-white"
                                                : !selectedDate
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tables Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                        Mesas disponibles
                    </h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner className="h-8 w-8 text-amber-500" />
                        </div>
                    ) : availableTables.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                            No hay mesas disponibles
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availableTables.map((table) => {
                                const tableId = table._id || table.id;
                                const selectedTableId = selectedTable?._id || selectedTable?.id;

                                return (
                                    <button
                                        key={tableId}
                                        onClick={() => onSelectTable(table)}
                                        className={`
                                            w-full p-3 rounded-lg border-2 transition text-left
                                            ${
                                                selectedTableId === tableId
                                                    ? "border-amber-500 bg-amber-50"
                                                    : "border-emerald-200 bg-emerald-50 hover:border-emerald-400"
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-slate-900">
                                                Mesa {table.numeroMesa}
                                            </span>
                                            <span className="text-sm text-slate-600">
                                                Capacidad: {table.capacidad}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
