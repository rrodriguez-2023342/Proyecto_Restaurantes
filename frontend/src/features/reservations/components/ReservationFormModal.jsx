import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { showError, showSuccess } from "../../../shared/utils/toast";

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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                    <option value="">Selecciona un restaurante</option>
                    {restaurants.map((r) => (
                        <option key={r._id || r.id} value={r._id || r.id}>
                            {r.nombre || r.name}
                        </option>
                    ))}
                </select>
                {errors.restaurante && (
                    <span className="text-xs text-red-500">{errors.restaurante.message}</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mesa
                </label>
                <select
                    {...register("mesa", { required: "Mesa es requerida" })}
                    disabled={!selectedRestaurant}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                {errors.mesa && (
                    <span className="text-xs text-red-500">{errors.mesa.message}</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha
                    </label>
                    <input
                        type="date"
                        min={today}
                        {...register("fecha", { required: "Fecha es requerida" })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {errors.fecha && (
                        <span className="text-xs text-red-500">{errors.fecha.message}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Hora
                    </label>
                    <input
                        type="time"
                        min={selectedRestaurantData?.horario?.apertura}
                        max={selectedRestaurantData?.horario?.cierre}
                        {...register("hora", { required: "Hora es requerida" })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {errors.hora && (
                        <span className="text-xs text-red-500">{errors.hora.message}</span>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Personas
                </label>
                <input
                    type="number"
                    value={selectedTable?.capacidad || ""}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                </label>
                <select
                    {...register("estado")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="CONFIRMADA">Confirmada</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                >
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    );
};
