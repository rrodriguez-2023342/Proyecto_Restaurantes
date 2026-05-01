import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Spinner } from "@material-tailwind/react";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useReservationStore } from "../store/useReservationStore";
import { useAuthStore } from "../../auth/store/authStore";
import { ReservationStatusBadge } from "../components/ReservationStatusBadge";

export const ReservationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        userReservations,
        loading,
        fetchUserReservations,
        updateReservation,
        deleteReservation,
    } = useReservationStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [editingReservation, setEditingReservation] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({ estado: "" });

    useEffect(() => {
        if (user?.id) {
            fetchUserReservations(user.id);
        }
    }, [fetchUserReservations, user?.id]);

    const filteredReservations = useMemo(() => {
        return userReservations.filter((res) => {
            const matchesSearch =
                !searchTerm ||
                res.restaurante?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                res.mesa?.numeroMesa?.toString().includes(searchTerm);

            const matchesStatus = !filterStatus || res.estado === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [userReservations, searchTerm, filterStatus]);

    const handleEditClick = (reservation) => {
        setEditingReservation(reservation);
        setEditData({ estado: reservation.estado });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await updateReservation(editingReservation._id || editingReservation.id, editData);
            showSuccess("Reservación actualizada exitosamente");
            setShowEditModal(false);
            setEditingReservation(null);
        } catch (err) {
            showError(err.response?.data?.message || "Error al actualizar la reservación");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelReservation = async () => {
        setSaving(true);
        try {
            await deleteReservation(cancelConfirm._id || cancelConfirm.id);
            showSuccess("Reservación cancelada exitosamente");
            setCancelConfirm(null);
        } catch (err) {
            showError(err.response?.data?.message || "Error al cancelar la reservación");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getReservationStats = () => {
        const total = userReservations.length;
        const confirmed = userReservations.filter((r) => r.estado === "CONFIRMADA").length;
        const completed = userReservations.filter((r) => r.estado === "COMPLETADA").length;
        const cancelled = userReservations.filter((r) => r.estado === "CANCELADA").length;

        return { total, confirmed, completed, cancelled };
    };

    const stats = getReservationStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-sm p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Mis Reservaciones</h1>
                <p className="text-amber-50">Gestiona tus reservaciones en los restaurantes</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs text-green-600 uppercase font-semibold mb-1">
                        Confirmadas
                    </p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Completadas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <p className="text-xs text-red-600 uppercase font-semibold mb-1">Canceladas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <Input
                            label="Buscar reservación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="!border-slate-300"
                        />
                    </div>
                    <button
                        onClick={() => navigate("/reservaciones/crear")}
                        className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                    >
                        + Nueva Reservación
                    </button>
                </div>

                {/* Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Estado
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner className="h-12 w-12 text-amber-500" />
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-slate-500 text-lg mb-4">No hay reservaciones para mostrar</p>
                        <button
                            onClick={() => navigate("/reservaciones/crear")}
                            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                        >
                            Crear tu primera reservación
                        </button>
                    </div>
                ) : (
                    filteredReservations.map((reservation) => (
                        <div
                            key={reservation._id || reservation.id}
                            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Info */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-600 uppercase font-semibold">
                                            Restaurante
                                        </p>
                                        <p className="text-lg font-bold text-slate-900">
                                            {reservation.restaurante?.nombre || "N/A"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase font-semibold">
                                                Mesa
                                            </p>
                                            <p className="text-base font-semibold text-slate-900">
                                                Mesa {reservation.mesa?.numeroMesa || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase font-semibold">
                                                Personas
                                            </p>
                                            <p className="text-base font-semibold text-slate-900">
                                                {reservation.cantidadPersonas}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-600 uppercase font-semibold">
                                            Fecha y Hora
                                        </p>
                                        <p className="text-base text-slate-900">
                                            {formatDate(reservation.fecha)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase font-semibold">
                                                Estado
                                            </p>
                                            <ReservationStatusBadge status={reservation.estado} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-slate-200 pt-4 mt-4 flex gap-2 justify-end">
                                {reservation.estado !== "CANCELADA" &&
                                    reservation.estado !== "COMPLETADA" && (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(reservation)}
                                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setCancelConfirm(reservation)}
                                                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={showEditModal} handler={() => setShowEditModal(false)}>
                <DialogHeader className="text-slate-900">Editar Reservación</DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-600 uppercase font-semibold mb-2">
                                Estado
                            </p>
                            <select
                                value={editData.estado}
                                onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="CONFIRMADA">Confirmada</option>
                                <option value="COMPLETADA">Completada</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </DialogFooter>
            </Dialog>

            {/* Cancel Confirmation Modal */}
            <Dialog open={!!cancelConfirm} handler={() => setCancelConfirm(null)}>
                <DialogHeader className="text-slate-900">Cancelar Reservación</DialogHeader>
                <DialogBody>
                    <p className="text-slate-600">
                        ¿Estás seguro de que deseas cancelar esta reservación?
                    </p>
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={() => setCancelConfirm(null)}
                        className="px-4 py-2 mr-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                        No
                    </button>
                    <button
                        onClick={handleCancelReservation}
                        disabled={saving}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {saving ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};
