import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../tables/store/useTableStore";
import { ReservationCalendar } from "../components/ReservationCalendar";

export const CreateReservationPage = () => {
    const navigate = useNavigate();
    const { createReservation } = useReservationStore();
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const { clearRestaurantTables } = useTableStore();

    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedTable, setSelectedTable] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    const handleRestaurantChange = (restaurantId) => {
        setSelectedRestaurant(restaurantId);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedTable(null);
        clearRestaurantTables();
    };

    const handleSubmit = async () => {
        if (!selectedRestaurant) {
            showError("Por favor selecciona un restaurante");
            return;
        }
        if (!selectedDate) {
            showError("Por favor selecciona una fecha");
            return;
        }
        if (!selectedTime) {
            showError("Por favor selecciona una hora");
            return;
        }
        if (!selectedTable) {
            showError("Por favor selecciona una mesa");
            return;
        }

        setSaving(true);
        try {
            const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);

            const payload = {
                restaurante: selectedRestaurant,
                mesa: selectedTable._id || selectedTable.id,
                fecha: dateTime.toISOString(),
                cantidadPersonas: selectedTable.capacidad,
                estado: "PENDIENTE",
            };

            await createReservation(payload);
            showSuccess("¡Reservación creada exitosamente!");
            navigate("/reservaciones");
        } catch (err) {
            showError(err.response?.data?.message || "Error al crear la reservación");
        } finally {
            setSaving(false);
        }
    };

    const isFormComplete =
        selectedRestaurant && selectedDate && selectedTime && selectedTable;
    const selectedRestaurantData = restaurants.find(
        (restaurant) => (restaurant._id || restaurant.id) === selectedRestaurant
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Nueva Reservación</h1>
                <p className="text-amber-50">Reserva una mesa en tu restaurante favorito</p>
            </div>

            {/* Step 1: Select Restaurant */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Paso 1: Selecciona un Restaurante</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Restaurante
                    </label>
                    <select
                        value={selectedRestaurant}
                        onChange={(e) => handleRestaurantChange(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">-- Selecciona un restaurante --</option>
                        {restaurants.map((r) => (
                            <option key={r._id || r.id} value={r._id || r.id}>
                                {r.nombre || r.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Step 2: Select Date & Time */}
            {selectedRestaurant && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                        Paso 2: Selecciona Fecha y Hora
                    </h2>
                    <ReservationCalendar
                        restaurantId={selectedRestaurant}
                        restaurant={selectedRestaurantData}
                        onSelectDate={setSelectedDate}
                        onSelectTime={setSelectedTime}
                        onSelectTable={setSelectedTable}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        selectedTable={selectedTable}
                    />
                </div>
            )}

            {/* Summary */}
            {selectedRestaurant && (
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-600 uppercase font-semibold">Restaurante</p>
                            <p className="text-lg font-bold text-slate-900">
                                {restaurants.find((r) => (r._id || r.id) === selectedRestaurant)
                                    ?.nombre || "No seleccionado"}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-600 uppercase font-semibold">Fecha</p>
                            <p className="text-lg font-bold text-slate-900">
                                {selectedDate
                                    ? new Date(selectedDate).toLocaleDateString("es-ES")
                                    : "No seleccionada"}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-600 uppercase font-semibold">Hora</p>
                            <p className="text-lg font-bold text-slate-900">
                                {selectedTime || "No seleccionada"}
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-600 uppercase font-semibold">Personas</p>
                            <p className="text-lg font-bold text-slate-900">
                                {selectedTable ? selectedTable.capacidad : "No seleccionadas"}
                            </p>
                        </div>
                        {selectedTable && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <p className="text-xs text-amber-600 uppercase font-semibold">
                                    Mesa
                                </p>
                                <p className="text-lg font-bold text-amber-900">
                                    Mesa {selectedTable.numeroMesa}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-end">
                <button
                    onClick={() => navigate("/reservaciones")}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!isFormComplete || saving}
                    className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition font-medium"
                >
                    {saving ? "Reservando..." : "Confirmar Reservación"}
                </button>
            </div>
        </div>
    );
};
