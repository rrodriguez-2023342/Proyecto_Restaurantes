import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogBody, DialogHeader, DialogFooter, Input, Spinner } from "@material-tailwind/react";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../tables/store/useTableStore";
import { ReservationFormModal } from "../components/ReservationFormModal";
import { ReservationStatusBadge } from "../components/ReservationStatusBadge";

const getRelationId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value._id || value.id || "");
};

const getRestaurantName = (reservation, restaurants) => {
    if (typeof reservation.restaurante === "object" && reservation.restaurante?.nombre) {
        return reservation.restaurante.nombre;
    }

    const restauranteId = getRelationId(reservation.restaurante);
    const restaurant = restaurants.find((item) => getRelationId(item) === restauranteId);
    return restaurant?.nombre || restaurant?.name || "Restaurante sin nombre";
};

const RESERVATIONS_PER_PAGE = 10;

export const AdminReservationsPage = () => {
    const {
        reservations,
        loading,
        fetchReservations,
        createReservation,
        updateReservation,
        deleteReservation,
    } = useReservationStore();
    const { restaurants, fetchRestaurants } = useRestaurantStore();
    const { restaurantTables, fetchRestaurantTables, clearRestaurantTables } = useTableStore();

    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRestaurant, setFilterRestaurant] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [selectedRestaurantForTables, setSelectedRestaurantForTables] = useState("");

    const buildReservationQuery = (restaurantId = filterRestaurant) => ({
        limit: 1000,
        ...(restaurantId ? { restaurante: restaurantId } : {}),
    });

    useEffect(() => {
        fetchReservations({ limit: 1000 });
        fetchRestaurants();
    }, [fetchReservations, fetchRestaurants]);

    useEffect(() => {
        if (selectedRestaurantForTables) {
            fetchRestaurantTables(selectedRestaurantForTables);
        } else {
            clearRestaurantTables();
        }
    }, [clearRestaurantTables, fetchRestaurantTables, selectedRestaurantForTables]);

    const filteredReservations = useMemo(() => {
        return reservations.filter((res) => {
            const restauranteId = getRelationId(res.restaurante);
            const restauranteNombre =
                typeof res.restaurante === "object"
                    ? res.restaurante?.nombre?.toLowerCase()
                    : "";
            const matchesSearch =
                !searchTerm ||
                res._id?.includes(searchTerm) ||
                res.usuario?.includes(searchTerm) ||
                restauranteNombre?.includes(searchTerm.toLowerCase());

            const matchesStatus = !filterStatus || res.estado === filterStatus;
            const matchesRestaurant = !filterRestaurant || restauranteId === filterRestaurant;

            return matchesSearch && matchesStatus && matchesRestaurant;
        });
    }, [reservations, searchTerm, filterStatus, filterRestaurant]);

    const restaurantSummaries = useMemo(() => {
        const summaries = new Map();
        const normalizedSearch = searchTerm.trim().toLowerCase();

        reservations.forEach((reservation) => {
            const restauranteId = getRelationId(reservation.restaurante) || "sin-restaurante";
            const restauranteNombre = getRestaurantName(reservation, restaurants);

            if (normalizedSearch && !restauranteNombre.toLowerCase().includes(normalizedSearch)) {
                return;
            }

            if (!summaries.has(restauranteId)) {
                summaries.set(restauranteId, {
                    id: restauranteId,
                    nombre: restauranteNombre,
                    total: 0,
                    PENDIENTE: 0,
                    CONFIRMADA: 0,
                    CANCELADA: 0,
                    COMPLETADA: 0,
                });
            }

            const summary = summaries.get(restauranteId);
            summary.total += 1;
            if (summary[reservation.estado] != null) {
                summary[reservation.estado] += 1;
            }
        });

        return Array.from(summaries.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [reservations, restaurants, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredReservations.length / RESERVATIONS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedReservations = useMemo(() => {
        const start = (safeCurrentPage - 1) * RESERVATIONS_PER_PAGE;
        return filteredReservations.slice(start, start + RESERVATIONS_PER_PAGE);
    }, [safeCurrentPage, filteredReservations]);

    const handleOpenModal = (reservation = null, restaurantId = null) => {
        if (restaurantId) {
            setSelectedRestaurantForTables(restaurantId);
        }
        setEditing(reservation);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditing(null);
        setSelectedRestaurantForTables("");
        clearRestaurantTables();
    };

    const handleRestaurantFilterChange = async (restaurantId) => {
        setFilterRestaurant(restaurantId);
        setCurrentPage(1);
        try {
            await fetchReservations(buildReservationQuery(restaurantId));
        } catch (err) {
            showError(err.response?.data?.message || "Error al filtrar reservaciones");
        }
    };

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            if (editing) {
                await updateReservation(editing._id || editing.id, data);
                showSuccess("Reservación actualizada exitosamente");
            } else {
                await createReservation(data);
                showSuccess("Reservación creada exitosamente");
            }
            await fetchReservations(buildReservationQuery());
            handleCloseModal();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await deleteReservation(deleteConfirm._id || deleteConfirm.id);
            showSuccess("Reservación eliminada exitosamente");
            await fetchReservations(buildReservationQuery());
            setDeleteConfirm(null);
        } catch (err) {
            showError(err.response?.data?.message || err.message || "Error al eliminar la reservacion");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Reservaciones</h1>
                <p className="text-slate-600">Administra todas las reservaciones del sistema</p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1 w-full md:w-auto">
                        <Input
                            label="Buscar reservación..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="!border-slate-300"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-amber-500 px-6 text-sm font-medium text-white transition hover:bg-amber-600 md:w-auto"
                    >
                        + Nueva Reservación
                    </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Estado
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="CONFIRMADA">Confirmada</option>
                            <option value="COMPLETADA">Completada</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Restaurante
                        </label>
                        <select
                            value={filterRestaurant}
                            onChange={(e) => handleRestaurantFilterChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Todos los restaurantes</option>
                            {restaurants.map((r) => (
                                <option key={r._id || r.id} value={r._id || r.id}>
                                    {r.nombre || r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            {!filterRestaurant ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner className="h-12 w-12 text-amber-500" />
                        </div>
                    ) : restaurantSummaries.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500 text-lg">No hay reservaciones para mostrar</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {restaurantSummaries.map((summary) => (
                                <div
                                    key={summary.id}
                                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {summary.nombre}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {summary.total} reservaciones
                                            </p>
                                        </div>
                                        <span className="rounded bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                            Total {summary.total}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
                                            <p className="text-xs font-semibold uppercase text-yellow-700">Pendientes</p>
                                            <p className="text-2xl font-bold text-yellow-900">{summary.PENDIENTE}</p>
                                        </div>
                                        <div className="rounded border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold uppercase text-blue-700">Confirmadas</p>
                                            <p className="text-2xl font-bold text-blue-900">{summary.CONFIRMADA}</p>
                                        </div>
                                        <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
                                            <p className="text-xs font-semibold uppercase text-emerald-700">Completas</p>
                                            <p className="text-2xl font-bold text-emerald-900">{summary.COMPLETADA}</p>
                                        </div>
                                        <div className="rounded border border-red-200 bg-red-50 p-3">
                                            <p className="text-xs font-semibold uppercase text-red-700">Canceladas</p>
                                            <p className="text-2xl font-bold text-red-900">{summary.CANCELADA}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner className="h-12 w-12 text-amber-500" />
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 text-lg">No hay reservaciones para mostrar</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Restaurante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Mesa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Personas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedReservations.map((reservation) => (
                                    <tr
                                        key={reservation._id || reservation.id}
                                        className="border-b border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {(reservation._id || reservation.id)?.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            {reservation.usuario}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            {reservation.restaurante?.nombre || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            Mesa {reservation.mesa?.numeroMesa || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {formatDate(reservation.fecha)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            {reservation.cantidadPersonas}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ReservationStatusBadge status={reservation.estado} />
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleOpenModal(
                                                        reservation,
                                                        getRelationId(reservation.restaurante)
                                                    )
                                                }
                                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(reservation)}
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
                            <p className="text-sm text-slate-600">
                                Mostrando {paginatedReservations.length} de {filteredReservations.length} reservaciones
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="px-3 py-1.5 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="px-3 py-1.5 text-sm font-semibold text-slate-700">
                                    {safeCurrentPage} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="px-3 py-1.5 rounded border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={openModal} handler={handleCloseModal}>
                <DialogHeader className="text-slate-900">
                    {editing ? "Editar Reservación" : "Nueva Reservación"}
                </DialogHeader>
                <DialogBody>
                    <ReservationFormModal
                        reservation={editing}
                        onSubmit={handleSubmit}
                        onClose={handleCloseModal}
                        loading={saving}
                        restaurants={restaurants}
                        tables={restaurantTables}
                        onRestaurantChange={setSelectedRestaurantForTables}
                    />
                </DialogBody>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={!!deleteConfirm} handler={() => setDeleteConfirm(null)}>
                <DialogHeader className="text-slate-900">
                    Confirmar eliminación
                </DialogHeader>
                <DialogBody>
                    <p className="text-slate-600">
                        ¿Estás seguro de que deseas eliminar esta reservación?
                    </p>
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {saving ? "Eliminando..." : "Eliminar"}
                    </button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};
