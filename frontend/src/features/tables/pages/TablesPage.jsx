import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogBody, DialogFooter, DialogHeader, Spinner } from "@material-tailwind/react";
import { Armchair, Building2, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
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

    const autoRestaurantId = useMemo(() => {
        if (selectedRestaurant || restaurants.length !== 1) return "";
        return restaurants[0]._id || restaurants[0].id || "";
    }, [restaurants, selectedRestaurant]);

    const activeRestaurant = selectedRestaurant || autoRestaurantId;
    const availableTables = restaurantTables.filter((table) => table.disponibilidad).length;
    const unavailableTables = restaurantTables.length - availableTables;

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    useEffect(() => {
        if (activeRestaurant) {
            fetchRestaurantTables(activeRestaurant);
        }
    }, [activeRestaurant, fetchRestaurantTables]);

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
        if (!activeRestaurant) {
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
                restaurante: activeRestaurant,
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
            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="admin-kicker">Mapa operativo</p>
                        <h1 className={adminTheme.pageTitle}>Gestion de mesas</h1>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            Administra disponibilidad, capacidad y numeracion por restaurante.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[26rem]">
                        <MetricCard label="Total" value={restaurantTables.length} className="bg-slate-950 text-amber-400" />
                        <MetricCard label="Disponibles" value={availableTables} className="bg-emerald-50 text-emerald-800" />
                        <MetricCard label="No disponibles" value={unavailableTables} className="bg-rose-50 text-rose-800" />
                    </div>
                </div>
            </section>

            <section className="admin-surface rounded-2xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="w-full flex-1">
                        <label className={adminTheme.label}>Restaurante</label>
                        <div className="relative mt-2">
                            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <select
                                value={activeRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                className={`w-full pl-11 ${adminTheme.select}`}
                            >
                                <option value="">Elige un restaurante</option>
                                {restaurants.map((r) => (
                                    <option key={r._id || r.id} value={r._id || r.id}>
                                        {r.nombre || r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        disabled={!activeRestaurant}
                        className={`${adminTheme.primaryButton} h-12 w-full gap-2 md:w-auto`}
                    >
                        <Plus size={16} />
                        Nueva mesa
                    </button>
                </div>
            </section>

            <section className="admin-surface rounded-2xl p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <p className="admin-kicker">Plano de mesas</p>
                        <h2 className={adminTheme.sectionTitle}>Disponibilidad visual</h2>
                    </div>
                </div>

                {!activeRestaurant ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                        <p className="text-sm font-bold text-slate-500">Selecciona un restaurante para ver sus mesas</p>
                    </div>
                ) : loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Spinner className="h-12 w-12 text-amber-500" />
                    </div>
                ) : (
                    <TableGrid tables={restaurantTables} loading={loading} />
                )}
            </section>

            {activeRestaurant && (
                <section className="admin-card overflow-hidden rounded-2xl bg-white">
                    <div className="admin-panel-heading border-b border-slate-900 p-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.28em] !text-white">Mesas registradas</h2>
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
                                        {["Mesa", "Capacidad", "Disponibilidad", "Acciones"].map((heading) => (
                                            <th key={heading} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurantTables.map((table) => (
                                        <tr
                                            key={table._id || table.id}
                                            className="border-b border-slate-100 transition hover:bg-amber-50/60"
                                        >
                                            <td className="px-6 py-4 text-sm font-black text-slate-900">
                                                <span className="inline-flex items-center gap-2">
                                                    <Armchair size={16} className="text-amber-600" />
                                                    Mesa {table.numeroMesa}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <UsersRound size={15} className="text-slate-400" />
                                                    {table.capacidad} personas
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${
                                                        table.disponibilidad
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-rose-100 text-rose-800"
                                                    }`}
                                                >
                                                    {table.disponibilidad ? "Disponible" : "No disponible"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(table)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-white px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={14} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(table)}
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
                        </div>
                    )}
                </section>
            )}

            <Dialog open={openModal} handler={handleCloseModal} className="overflow-hidden rounded-2xl">
                <DialogHeader className="border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">
                            Mapa operativo
                        </p>
                        <h2 className="mt-2 text-xl font-black uppercase tracking-tight">
                            {editing ? "Editar mesa" : "Nueva mesa"}
                        </h2>
                    </div>
                </DialogHeader>
                <DialogBody className="p-6">
                    <div className="space-y-4">
                        {!editing && (
                            <div>
                                <label className={adminTheme.label}>Numero de mesa</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.numeroMesa}
                                    onChange={(e) =>
                                        setFormData({ ...formData, numeroMesa: e.target.value })
                                    }
                                    className={`mt-2 w-full ${adminTheme.input}`}
                                />
                            </div>
                        )}
                        {editing && (
                            <div>
                                <label className={adminTheme.label}>Numero de mesa</label>
                                <input
                                    type="number"
                                    value={editing.numeroMesa}
                                    disabled
                                    className={`mt-2 w-full ${adminTheme.input} bg-slate-100 text-slate-600`}
                                />
                            </div>
                        )}

                        <div>
                            <label className={adminTheme.label}>Capacidad</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={formData.capacidad}
                                onChange={(e) =>
                                    setFormData({ ...formData, capacidad: e.target.value })
                                }
                                className={`mt-2 w-full ${adminTheme.input}`}
                            />
                        </div>

                        <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span>
                                <span className="block text-sm font-black text-slate-900">Disponible</span>
                                <span className="block text-xs font-semibold text-slate-500">La mesa puede usarse para nuevas reservaciones.</span>
                            </span>
                            <input
                                type="checkbox"
                                id="disponibilidad"
                                checked={formData.disponibilidad}
                                onChange={(e) =>
                                    setFormData({ ...formData, disponibilidad: e.target.checked })
                                }
                                className="h-5 w-5 rounded border-slate-300 accent-amber-500"
                            />
                        </label>
                    </div>
                </DialogBody>
                <DialogFooter className="border-t border-slate-100">
                    <button onClick={handleCloseModal} className={`${adminTheme.neutralButton} mr-2`}>
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} disabled={saving} className={adminTheme.primaryButton}>
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </DialogFooter>
            </Dialog>

            <Dialog open={!!deleteConfirm} handler={() => setDeleteConfirm(null)} className="rounded-2xl">
                <DialogHeader className="text-slate-900">Confirmar eliminacion</DialogHeader>
                <DialogBody>
                    <p className="text-slate-600">
                        Estas seguro de que deseas eliminar esta mesa?
                    </p>
                </DialogBody>
                <DialogFooter>
                    <button onClick={() => setDeleteConfirm(null)} className={`${adminTheme.neutralButton} mr-2`}>
                        Cancelar
                    </button>
                    <button onClick={handleDelete} disabled={saving} className={adminTheme.destructiveButton}>
                        {saving ? "Eliminando..." : "Eliminar"}
                    </button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

const MetricCard = ({ label, value, className }) => (
    <div className={`rounded-2xl border border-slate-200 p-4 ${className}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
        <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
);
