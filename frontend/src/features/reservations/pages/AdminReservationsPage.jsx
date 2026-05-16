import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, Input, Spinner } from "@material-tailwind/react";
import { Building2, CalendarDays, Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useReservationStore } from "../store/useReservationStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { useTableStore } from "../../tables/store/useTableStore";
import { ReservationFormModal } from "../components/ReservationFormModal";
import { ReservationStatusBadge } from "../components/ReservationStatusBadge";
import { adminTheme } from "../../../constants/theme";

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
            const normalizedSearch = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                res._id?.includes(searchTerm) ||
                res.usuario?.toLowerCase?.().includes(normalizedSearch) ||
                restauranteNombre?.includes(normalizedSearch);

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

    const dashboardStats = useMemo(() => {
        return reservations.reduce(
            (stats, reservation) => {
                stats.total += 1;
                if (stats[reservation.estado] != null) stats[reservation.estado] += 1;
                return stats;
            },
            { total: 0, PENDIENTE: 0, CONFIRMADA: 0, COMPLETADA: 0, CANCELADA: 0 }
        );
    }, [reservations]);

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
                showSuccess("Reservacion actualizada exitosamente");
            } else {
                await createReservation(data);
                showSuccess("Reservacion creada exitosamente");
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
            showSuccess("Reservacion eliminada exitosamente");
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
            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="admin-kicker">Agenda operativa</p>
                        <h1 className={`${adminTheme.pageTitle} mt-2`}>
                            Gestion de reservaciones
                        </h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Administra ocupacion, mesas y estados por restaurante.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[34rem]">
                        {[
                            ["Total", dashboardStats.total, "bg-slate-950 text-amber-400"],
                            ["Pendientes", dashboardStats.PENDIENTE, "bg-amber-50 text-amber-800"],
                            ["Confirmadas", dashboardStats.CONFIRMADA, "bg-emerald-50 text-emerald-800"],
                            ["Canceladas", dashboardStats.CANCELADA, "bg-rose-50 text-rose-800"],
                        ].map(([label, value, className]) => (
                            <div key={label} className={`rounded-2xl border border-slate-200 p-4 ${className}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-80">{label}</p>
                                <p className="mt-2 text-2xl font-black">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="grid flex-1 gap-4 md:grid-cols-[1.2fr_0.8fr_1fr]">
                        <div>
                            <label className={adminTheme.label}>Busqueda</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    label="Buscar reservacion..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="!border-slate-200 !pl-11 focus:!border-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={adminTheme.label}>Estado</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className={`w-full ${adminTheme.select}`}
                            >
                                <option value="">Todos</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="CONFIRMADA">Confirmada</option>
                                <option value="COMPLETADA">Completada</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        </div>

                        <div>
                            <label className={adminTheme.label}>Restaurante</label>
                            <select
                                value={filterRestaurant}
                                onChange={(e) => handleRestaurantFilterChange(e.target.value)}
                                className={`w-full ${adminTheme.select}`}
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

                    <button onClick={() => handleOpenModal()} className={`${adminTheme.primaryButton} h-12 w-full gap-2 xl:w-auto`}>
                        <Plus size={16} />
                        Nueva reservacion
                    </button>
                </div>
            </section>

            {!filterRestaurant ? (
                <section className="admin-surface rounded-2xl p-6">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Spinner className="h-12 w-12 text-amber-500" />
                        </div>
                    ) : restaurantSummaries.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-lg font-semibold text-slate-500">No hay reservaciones para mostrar</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {restaurantSummaries.map((summary) => (
                                <button
                                    key={summary.id}
                                    type="button"
                                    onClick={() => handleRestaurantFilterChange(summary.id === "sin-restaurante" ? "" : summary.id)}
                                    className="admin-card group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl"
                                >
                                    <div className="mb-5 flex items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-lg shadow-slate-900/10">
                                                <Building2 size={20} />
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-950">{summary.nombre}</h3>
                                                <p className="text-sm font-semibold text-slate-500">{summary.total} reservaciones</p>
                                            </div>
                                        </div>
                                        <span className="rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-700">
                                            Ver
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <StatusMetric label="Pendientes" value={summary.PENDIENTE} className="border-amber-200 bg-amber-50 text-amber-800" />
                                        <StatusMetric label="Confirmadas" value={summary.CONFIRMADA} className="border-slate-200 bg-slate-50 text-slate-900" />
                                        <StatusMetric label="Completas" value={summary.COMPLETADA} className="border-emerald-200 bg-emerald-50 text-emerald-800" />
                                        <StatusMetric label="Canceladas" value={summary.CANCELADA} className="border-rose-200 bg-rose-50 text-rose-800" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                <section className="admin-card overflow-hidden rounded-2xl bg-white">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Spinner className="h-12 w-12 text-amber-500" />
                        </div>
                    ) : filteredReservations.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-lg font-semibold text-slate-500">No hay reservaciones para mostrar</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950">
                                        {["ID", "Usuario", "Restaurante", "Mesa", "Fecha", "Personas", "Estado", "Acciones"].map((heading) => (
                                            <th key={heading} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedReservations.map((reservation) => (
                                        <tr
                                            key={reservation._id || reservation.id}
                                            className="border-b border-slate-100 transition hover:bg-amber-50/60"
                                        >
                                            <td className="px-6 py-4 text-sm font-black text-amber-700">
                                                #{(reservation._id || reservation.id)?.slice(-6)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                {reservation.usuario}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                {reservation.restaurante?.nombre || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                Mesa {reservation.mesa?.numeroMesa || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <CalendarDays size={15} className="text-amber-600" />
                                                    {formatDate(reservation.fecha)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                                <span className="inline-flex items-center gap-2">
                                                    <UsersRound size={15} className="text-slate-500" />
                                                    {reservation.cantidadPersonas}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ReservationStatusBadge status={reservation.estado} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenModal(
                                                                reservation,
                                                                getRelationId(reservation.restaurante)
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-white px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(reservation)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white transition hover:bg-rose-700"
                                                    >
                                                        <Trash2 size={14} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 md:flex-row">
                                <p className="text-sm font-semibold text-slate-600">
                                    Mostrando {paginatedReservations.length} de {filteredReservations.length} reservaciones
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={safeCurrentPage === 1}
                                        className={adminTheme.neutralButton}
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1.5 text-sm font-black text-slate-700">
                                        {safeCurrentPage} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        disabled={safeCurrentPage === totalPages}
                                        className={adminTheme.neutralButton}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            )}

            <Dialog open={openModal} handler={handleCloseModal} size="lg" className="overflow-hidden rounded-2xl">
                <DialogHeader className="border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">
                            {editing ? "Actualizar agenda" : "Crear agenda"}
                        </p>
                        <h2 className="mt-1 text-xl font-black uppercase tracking-tight">
                            {editing ? "Editar reservacion" : "Nueva reservacion"}
                        </h2>
                    </div>
                </DialogHeader>
                <DialogBody className="bg-white p-0">
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

            <Dialog open={!!deleteConfirm} handler={() => setDeleteConfirm(null)} className="rounded-2xl">
                <DialogHeader className="text-slate-900">Confirmar eliminacion</DialogHeader>
                <DialogBody>
                    <p className="text-slate-600">Estas seguro de que deseas eliminar esta reservacion?</p>
                </DialogBody>
                <DialogFooter>
                    <button onClick={() => setDeleteConfirm(null)} className={`${adminTheme.neutralButton} mr-2`}>
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Eliminando..." : "Eliminar"}
                    </button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

const StatusMetric = ({ label, value, className }) => (
    <div className={`rounded-xl border p-3 ${className}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
        <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
);
