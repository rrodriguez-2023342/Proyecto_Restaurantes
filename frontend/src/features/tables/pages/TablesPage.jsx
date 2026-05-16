import { useEffect, useState } from "react";
import { Dialog, DialogBody, DialogHeader, DialogFooter, Spinner } from "@material-tailwind/react";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useTableStore } from "../store/useTableStore";
import { useRestaurantStore } from "../../restaurants/store/useRestaurantStore";
import { TableGrid } from "../components/TableGrid";
import { adminTheme } from "../../../constants/theme";

export const TablesPage = () => {
    const {
        restaurantTables,
        loading,
        fetchRestaurantTables,
        createTable,
        updateTable,
        deleteTable,
    } = useTableStore();
    const { restaurants, fetchRestaurants } = useRestaurantStore();

    const [openModal, setOpenModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        numeroMesa: "",
        capacidad: "",
        disponibilidad: true,
    });

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    useEffect(() => {
        if (!selectedRestaurant && restaurants.length === 1) {
            setSelectedRestaurant(restaurants[0]._id || restaurants[0].id);
        }
    }, [restaurants, selectedRestaurant]);

    useEffect(() => {
        if (selectedRestaurant) {
            fetchRestaurantTables(selectedRestaurant);
        }
    }, [fetchRestaurantTables, selectedRestaurant]);

    const handleOpenModal = (table = null) => {
        setEditing(table);
        if (table) {
            setFormData({
                numeroMesa: table.numeroMesa || "",
                capacidad: table.capacidad,
                disponibilidad: table.disponibilidad,
            });
        } else {
            const nextTableNumber =
                restaurantTables.length > 0
                    ? Math.max(...restaurantTables.map((t) => Number(t.numeroMesa) || 0)) + 1
                    : 1;

            setFormData({
                numeroMesa: nextTableNumber,
                capacidad: "",
                disponibilidad: true,
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditing(null);
        setFormData({
            numeroMesa: "",
            capacidad: "",
            disponibilidad: true,
        });
    };

    const handleSubmit = async () => {
        if (!selectedRestaurant) {
            showError("Selecciona un restaurante");
            return;
        }
        if (!editing && (!formData.numeroMesa || formData.numeroMesa < 1)) {
            showError("El numero de mesa debe ser al menos 1");
            return;
        }
        if (!formData.capacidad || formData.capacidad < 1) {
            showError("La capacidad debe ser al menos 1");
            return;
        }
        if (formData.capacidad > 12) {
            showError("La capacidad maxima por mesa es de 12 personas");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                restaurante: selectedRestaurant,
                capacidad: parseInt(formData.capacidad),
                disponibilidad: formData.disponibilidad,
            };

            if (editing) {
                await updateTable(editing._id || editing.id, payload);
                showSuccess("Mesa actualizada exitosamente");
            } else {
                await createTable({
                    ...payload,
                    numeroMesa: parseInt(formData.numeroMesa),
                });
                showSuccess("Mesa creada exitosamente");
            }
            handleCloseModal();
        } catch (err) {
            showError(err.response?.data?.message || err.message || "Error al procesar la mesa");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSaving(true);
            await deleteTable(deleteConfirm._id || deleteConfirm.id);
            showSuccess("Mesa eliminada exitosamente");
            setDeleteConfirm(null);
        } catch (err) {
            showError(err.message || "Error al eliminar la mesa");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="admin-surface rounded-2xl p-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Mesas</h1>
                <p className="text-slate-600">Administra las mesas de tus restaurantes</p>
            </div>

            {/* Actions */}
            <div className="admin-surface rounded-2xl p-6 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Selecciona un restaurante
                        </label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className={`w-full ${adminTheme.select}`}
                        >
                            <option value="">Elige un restaurante</option>
                            {restaurants.map((r) => (
                                <option key={r._id || r.id} value={r._id || r.id}>
                                    {r.nombre || r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={!selectedRestaurant}
                        className={`${adminTheme.primaryButton} h-12 w-full md:w-auto`}
                    >
                        + Nueva Mesa
                    </button>
                </div>
            </div>

            {/* Table Grid */}
            <div className="admin-surface rounded-2xl p-6">
                {!selectedRestaurant ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Selecciona un restaurante para ver sus mesas</p>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner className="h-12 w-12 text-amber-500" />
                    </div>
                ) : (
                    <TableGrid tables={restaurantTables} loading={loading} />
                )}
            </div>

            {/* Tables List (Admin View) */}
            {selectedRestaurant && (
                <div className="admin-card rounded-2xl bg-white overflow-hidden">
                    <div className="admin-panel-heading p-6 border-b border-slate-900">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.28em] text-white">Mesas Registradas</h2>
                    </div>
                    {restaurantTables.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-slate-500">No hay mesas registradas para este restaurante</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800 bg-slate-950">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.24em]">
                                            Mesa
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.24em]">
                                            Capacidad
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.24em]">
                                            Disponibilidad
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.24em]">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurantTables.map((table) => (
                                        <tr
                                            key={table._id || table.id}
                                            className="border-b border-slate-100 hover:bg-amber-50/60 transition"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                Mesa {table.numeroMesa}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {table.capacidad} personas
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                                        table.disponibilidad
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-rose-100 text-rose-800"
                                                    }`}
                                                >
                                                    {table.disponibilidad ? "Disponible" : "No disponible"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(table)}
                                                    className="rounded-lg border border-amber-500/30 bg-white px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(table)}
                                                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <Dialog open={openModal} handler={handleCloseModal}>
                <DialogHeader className="text-slate-900">
                    {editing ? "Editar Mesa" : "Nueva Mesa"}
                </DialogHeader>
                <DialogBody>
                    <div className="space-y-4">
                        {!editing && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Numero de Mesa
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.numeroMesa}
                                    onChange={(e) =>
                                        setFormData({ ...formData, numeroMesa: e.target.value })
                                    }
                                    className={`w-full ${adminTheme.input}`}
                                />
                            </div>
                        )}
                        {editing && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Número de Mesa
                                </label>
                                <input
                                    type="number"
                                    value={editing.numeroMesa}
                                    disabled
                                    className={`w-full ${adminTheme.input} bg-slate-100 text-slate-600`}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Capacidad (personas)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={formData.capacidad}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacidad: e.target.value })
                                }
                                className={`w-full ${adminTheme.input}`}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="disponibilidad"
                                checked={formData.disponibilidad}
                                onChange={(e) =>
                                    setFormData({ ...formData, disponibilidad: e.target.checked })
                                }
                                className="w-4 h-4 rounded border-slate-300"
                            />
                            <label htmlFor="disponibilidad" className="text-sm text-slate-700">
                                Disponible
                            </label>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={handleCloseModal}
                        className={`${adminTheme.neutralButton} mr-2`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={adminTheme.primaryButton}
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </DialogFooter>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirm} handler={() => setDeleteConfirm(null)}>
                <DialogHeader className="text-slate-900">Confirmar eliminación</DialogHeader>
                <DialogBody>
                    <p className="text-slate-600">
                        ¿Estás seguro de que deseas eliminar esta mesa?
                    </p>
                </DialogBody>
                <DialogFooter>
                    <button
                        onClick={() => setDeleteConfirm(null)}
                        className={`${adminTheme.neutralButton} mr-2`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={saving}
                        className={adminTheme.destructiveButton}
                    >
                        {saving ? "Eliminando..." : "Eliminar"}
                    </button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};
