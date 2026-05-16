import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Building2, CalendarDays, CheckCircle2, Clock, Table2, UsersRound, X } from "lucide-react";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { adminTheme } from "../../../constants/theme";

const getRelationId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value._id || value.id || "";
};

const getReservationDefaults = (reservation) => ({
    restaurante: getRelationId(reservation?.restaurante),
    mesa: getRelationId(reservation?.mesa),
    fecha: reservation?.fecha ? new Date(reservation.fecha).toISOString().split("T")[0] : "",
    hora: reservation?.fecha ? new Date(reservation.fecha).toTimeString().slice(0, 5) : "",
    estado: reservation?.estado || "PENDIENTE",
});

const labelClass = "mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500";
const fieldClass = `w-full ${adminTheme.input}`;
const selectClass = `w-full ${adminTheme.select}`;
const errorClass = "mt-1 block text-xs font-semibold text-rose-600";

export const ReservationFormModal = ({
    reservation = null,
    onSubmit,
    onClose,
    loading = false,
    restaurants = [],
    tables = [],
    onRestaurantChange,
}) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: getReservationDefaults(reservation),
    });

    const selectedMesa = useWatch({ control, name: "mesa" });
    const selectedRestaurant = useWatch({ control, name: "restaurante" });
    const currentReservationMesaId = getRelationId(reservation?.mesa);
    const currentMesaExistsInOptions = tables.some((table) => getRelationId(table) === currentReservationMesaId);
    const selectedTable =
        tables.find((table) => getRelationId(table) === selectedMesa) ||
        reservation?.mesa;
    const selectedRestaurantData = restaurants.find((restaurant) => (restaurant._id || restaurant.id) === selectedRestaurant);
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        reset(getReservationDefaults(reservation));
    }, [reservation, reset]);

    useEffect(() => {
        onRestaurantChange?.(selectedRestaurant || "");
    }, [onRestaurantChange, selectedRestaurant]);

    const handleFormSubmit = async (data) => {
        if (!data.restaurante) {
            showError("Selecciona un restaurante");
            return;
        }
        if (!data.mesa) {
            showError("Selecciona una mesa");
            return;
        }
        if (!data.fecha) {
            showError("Selecciona una fecha");
            return;
        }
        if (data.fecha < today) {
            showError("No puedes seleccionar una fecha anterior");
            return;
        }
        if (!data.hora) {
            showError("Selecciona una hora");
            return;
        }

        try {
            await onSubmit({
                ...data,
                fecha: new Date(`${data.fecha}T${data.hora}:00`).toISOString(),
                cantidadPersonas: selectedTable?.capacidad,
            });
            reset();
            showSuccess(reservation ? "Reservacion actualizada" : "Reservacion creada");
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || err.message || "Error al procesar la reservacion");
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 p-6">
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div>
                    <label className={labelClass}>
                        <Building2 size={14} className="text-amber-600" />
                        Restaurante
                    </label>
                    <select
                        {...register("restaurante", {
                            required: "Restaurante es requerido",
                            onChange: () => {
                                if (!reservation) setValue("mesa", "");
                            },
                        })}
                        disabled={!!reservation}
                        className={selectClass}
                    >
                        <option value="">Selecciona un restaurante</option>
                        {restaurants.map((r) => (
                            <option key={r._id || r.id} value={r._id || r.id}>
                                {r.nombre || r.name}
                            </option>
                        ))}
                    </select>
                    {errors.restaurante && <span className={errorClass}>{errors.restaurante.message}</span>}
                </div>

                <div>
                    <label className={labelClass}>
                        <Table2 size={14} className="text-amber-600" />
                        Mesa
                    </label>
                    <select
                        {...register("mesa", { required: "Mesa es requerida" })}
                        disabled={!selectedRestaurant}
                        className={selectClass}
                    >
                        <option value="">
                            {selectedRestaurant ? "Selecciona una mesa" : "Selecciona un restaurante primero"}
                        </option>
                        {reservation?.mesa && !currentMesaExistsInOptions && (
                            <option value={currentReservationMesaId}>
                                Mesa {reservation.mesa.numeroMesa || "actual"} - Capacidad: {reservation.mesa.capacidad || selectedTable?.capacidad || "N/A"}
                            </option>
                        )}
                        {tables.map((t) => (
                            <option key={getRelationId(t)} value={getRelationId(t)}>
                                Mesa {t.numeroMesa} - Capacidad: {t.capacidad}
                            </option>
                        ))}
                    </select>
                    {errors.mesa && <span className={errorClass}>{errors.mesa.message}</span>}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className={labelClass}>
                        <CalendarDays size={14} className="text-amber-600" />
                        Fecha
                    </label>
                    <input
                        type="date"
                        min={today}
                        {...register("fecha", { required: "Fecha es requerida" })}
                        className={fieldClass}
                    />
                    {errors.fecha && <span className={errorClass}>{errors.fecha.message}</span>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className={labelClass}>
                        <Clock size={14} className="text-amber-600" />
                        Hora
                    </label>
                    <input
                        type="time"
                        min={selectedRestaurantData?.horario?.apertura}
                        max={selectedRestaurantData?.horario?.cierre}
                        {...register("hora", { required: "Hora es requerida" })}
                        className={fieldClass}
                    />
                    {errors.hora && <span className={errorClass}>{errors.hora.message}</span>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 shadow-sm">
                    <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-400">
                        <UsersRound size={14} />
                        Personas
                    </label>
                    <input
                        type="number"
                        value={selectedTable?.capacidad || ""}
                        disabled
                        className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm disabled:cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className={labelClass}>
                    <CheckCircle2 size={14} className="text-amber-600" />
                    Estado
                </label>
                <select {...register("estado")} className={selectClass}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className={`${adminTheme.neutralButton} h-12 gap-2`}
                >
                    <X size={15} />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`${adminTheme.primaryButton} h-12 gap-2`}
                >
                    <CheckCircle2 size={15} />
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    );
};
