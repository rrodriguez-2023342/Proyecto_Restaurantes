import { useEffect, useMemo, useState } from "react";
import { BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { showError, showSuccess, showConfirm } from "../../../shared/utils/toast";
import { RestaurantForm } from "../components/RestaurantForm.jsx";
import { useRestaurantStore } from "../store/useRestaurantStore";
import { useAuthStore } from "../../auth/store/authStore";
import { getUsersByRole } from "../../../shared/api/users";
import { 
    LayoutDashboard, 
    Plus, 
    Settings, 
    Trash2, 
    Eye, 
    Power, 
    Clock, 
    MapPin, 
    Utensils, 
    Activity, 
    CheckCircle2, 
    XCircle,
    ChevronRight,
    Search
} from "lucide-react";

const PAGE_SIZE = 6;

const mapPayload = (values) => {
    const payload = new FormData();
    if (values.name) payload.append("nombre", values.name);
    if (values.description) payload.append("descripcion", values.description);
    if (values.category) payload.append("categoria", values.category);
    if (values.phone) payload.append("telefono", values.phone);
    if (values.street) payload.append("direccion.calle", values.street);
    if (values.city) payload.append("direccion.ciudad", values.city);
    payload.append("isActive", values.active === true || values.active === "true" ? "true" : "false");

    if (values.openingTime) payload.append("horario.apertura", values.openingTime);
    if (values.closingTime) payload.append("horario.cierre", values.closingTime);

    const days = Array.isArray(values.openDays) ? values.openDays : values.openDays ? [values.openDays] : [];
    days.forEach((day) => {
        if (day) payload.append("horario.diasAbierto", day);
    });

    if (values.photo?.length) payload.append("fotos", values.photo[0]);
    if (values.ownerId) payload.append('dueno', values.ownerId);

    return payload;
};

export const RestaurantsPage = () => {
    const { restaurants, loading, fetchRestaurants, createRestaurant: storeCreate, updateRestaurant: storeUpdate, deleteRestaurant: storeDelete } = useRestaurantStore();
    const userRole = useAuthStore((state) => state.user?.role);
    const isSuperAdmin = userRole === "ADMIN_ROLE";
    const [openModal, setOpenModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [owners, setOwners] = useState([]);
    const [showSpecs, setShowSpecs] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchRestaurants();
        (async () => {
            if (!isSuperAdmin) return;
            try {
                const [ownerRes, adminRes] = await Promise.allSettled([
                    getUsersByRole('ADMIN_RESTAURANT_ROLE'),
                    getUsersByRole('ADMIN_ROLE')
                ]);
                let allOwners = [];
                if (ownerRes.status === 'fulfilled') allOwners = [...allOwners, ...(ownerRes.value.data || [])];
                if (adminRes.status === 'fulfilled') allOwners = [...allOwners, ...(adminRes.value.data || [])];
                
                // Excluir al super admin (username 'admin', rol 'ADMIN_ROLE' o nombre 'Admin Admin')
                allOwners = allOwners.filter(user => 
                    user &&
                    user.username !== 'admin' && 
                    user.role !== 'ADMIN_ROLE' &&
                    `${user.name || ''} ${user.surname || ''}`.trim().toLowerCase() !== 'admin admin'
                );

                const unique = Array.from(new Map(allOwners.map(item => [item.id || item._id, item])).values());
                setOwners(unique);
            } catch (e) { /* ignore */ }
        })();
    }, [fetchRestaurants, isSuperAdmin]);

    const filteredRestaurants = restaurants.filter(r => 
        r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.categoria.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedRestaurants = useMemo(
        () => filteredRestaurants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [filteredRestaurants, currentPage]
    );

    const handleSubmit = async (values) => {
        try {
            setModalLoading(true);
            const payload = mapPayload(values);
            if (editing) {
                await storeUpdate(editing._id || editing.id, payload);
                showSuccess("Restaurante actualizado con éxito");
            } else {
                if (!isSuperAdmin) {
                    showError("Solo un administrador puede crear restaurantes");
                    return;
                }
                await storeCreate(payload);
                showSuccess("Nuevo restaurante registrado");
            }
            setOpenModal(false);
            setEditing(null);
        } catch (err) {
            const resp = err.response?.data;
            showError(resp?.message || "No se pudo procesar la solicitud");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (restaurant) => {
        const confirmed = await showConfirm({
            title: "¿Eliminar restaurante?",
            text: `¿Estás seguro de eliminar el restaurante "${restaurant.nombre || restaurant.name}" permanentemente? Se eliminarán todos sus menús, platos, mesas y reseñas en cascada.`,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });
        if (!confirmed) return;

        try {
            await storeDelete(restaurant._id || restaurant.id);
            showSuccess("Registro eliminado");
        } catch (err) {
            showError("Error al eliminar el registro");
        }
    };

    const handleToggleStatus = async (restaurant) => {
        try {
            const nextState = !restaurant?.isActive;
            await storeUpdate(restaurant._id || restaurant.id, { isActive: nextState });
            showSuccess(nextState ? "Restaurante activado" : "Restaurante en pausa");
        } catch (err) {
            showError("No se pudo cambiar el estado");
        }
    };

    const stats = {
        total: filteredRestaurants.length,
        active: filteredRestaurants.filter(r => r.isActive).length,
        inactive: filteredRestaurants.filter(r => !r.isActive).length
    };

    return (
        <div className="space-y-10 pb-20">
            {/* ── ADMIN CONTROL TOWER ── */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white">
                                <LayoutDashboard size={20} />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter">Control de Restaurantes</h2>
                        </div>
                        <p className="text-slate-400 font-medium max-w-md">Monitorea y administra la red de establecimientos de KinalEats en tiempo real.</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-6 rounded-3xl bg-white/5 border border-white/10 px-6 py-4 backdrop-blur-md">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black text-white leading-none">{stats.total}</p>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Activos</p>
                                <p className="text-2xl font-black text-white leading-none">{stats.active}</p>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Pausa</p>
                                <p className="text-2xl font-black text-white leading-none">{stats.inactive}</p>
                            </div>
                        </div>
                        {isSuperAdmin && (
                            <button
                                onClick={() => { setEditing(null); setOpenModal(true); }}
                                className="flex items-center gap-3 rounded-2xl bg-orange-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                            >
                                <Plus size={20} strokeWidth={3} />
                                Nuevo Registro
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ── SEARCH & FILTERS ── */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filtrar por nombre o categoría..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-2xl bg-white border border-slate-200 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* ── MODAL SYSTEM ── */}
            {openModal && (editing || isSuperAdmin) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                                    {editing ? <Settings size={16} /> : <Plus size={16} />}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editing ? "Configurar Restaurante" : "Registrar Restaurante"}
                                </h3>
                            </div>
                            <button onClick={() => { setOpenModal(false); setEditing(null); }} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <RestaurantForm
                                defaultValues={editing}
                                onSubmit={handleSubmit}
                                isLoading={modalLoading}
                                owners={owners}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── RESTAURANTS GRID ── */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                </div>
            ) : filteredRestaurants.length ? (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {paginatedRestaurants.map((restaurant) => (
                            <div
                                key={restaurant?._id || restaurant?.id}
                                className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2"
                            >
                                <div className="relative h-48 w-full bg-slate-50 overflow-hidden">
                                    {restaurant?.fotos ? (
                                        <img
                                            src={restaurant.fotos}
                                            alt={restaurant?.nombre}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-white">🍲</div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl border ${restaurant?.isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                                            <Activity size={10} />
                                            {restaurant?.isActive ? "Operativo" : "En Pausa"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-4">
                                        <h4 className="text-xl font-black text-slate-950 tracking-tight mb-1 group-hover:text-orange-500 transition-colors">
                                            {restaurant?.nombre}
                                        </h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Utensils size={10} />
                                            {restaurant?.categoria || "General"}
                                        </p>
                                    </div>

                                    <p className="line-clamp-2 text-sm text-slate-500 font-medium leading-relaxed mb-8">
                                        {restaurant?.descripcion || "Sin descripción disponible."}
                                    </p>

                                    <div className="mt-auto space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => { setEditing(restaurant); setOpenModal(true); }}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-950 hover:text-white transition-all active:scale-95 border border-slate-100"
                                            >
                                                <Settings size={14} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(restaurant)}
                                                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 border ${restaurant?.isActive ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white" : "bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white"}`}
                                            >
                                                <Power size={14} />
                                                {restaurant?.isActive ? "Pausar" : "Activar"}
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowSpecs(restaurant)}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-orange-500/10 hover:bg-orange-600 transition-all active:scale-95"
                                            >
                                                <Eye size={14} />
                                                Ficha Técnica
                                            </button>
                                            {isSuperAdmin && (
                                                <button
                                                    onClick={() => handleDelete(restaurant)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 transition-all active:scale-75"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            Mostrando {(currentPage - 1) * PAGE_SIZE + 1} - {(currentPage - 1) * PAGE_SIZE + paginatedRestaurants.length} de {filteredRestaurants.length}
                        </span>
                        <div className="flex w-full gap-2 sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState 
                    title="No hay registros activos" 
                    description={isSuperAdmin ? "Comienza por crear el primer restaurante de la red para que los usuarios puedan descubrirlo." : "No tienes restaurantes asignados todavia."}
                    actionLabel={isSuperAdmin ? "+ Nuevo Restaurante" : undefined}
                    onAction={isSuperAdmin ? () => { setEditing(null); setOpenModal(true); } : undefined}
                />
            )}

            {/* Specs Modal (Glassmorphism) */}
            {showSpecs && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg rounded-[3rem] bg-white p-10 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter italic">Ficha de Restaurante</h3>
                            <button onClick={() => setShowSpecs(null)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="space-y-10">
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500"><Clock size={16} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Ventana Operativa</h4>
                                </div>
                                <div className="rounded-[2rem] bg-orange-50/50 p-6 border border-orange-100">
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter italic">
                                        {showSpecs.horario?.apertura} — {showSpecs.horario?.cierre}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {showSpecs.horario?.diasAbierto?.map(day => (
                                            <span key={day} className="text-[9px] font-black uppercase tracking-widest bg-white border border-orange-200 px-3 py-1.5 rounded-xl text-orange-600">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><MapPin size={16} /></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Coordenadas de Sabor</h4>
                                </div>
                                <div className="rounded-[2rem] bg-blue-50/50 p-6 border border-blue-100">
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-700">
                                            <span className="text-blue-500 uppercase text-[9px] tracking-widest block mb-1">Calle / Avenida</span> 
                                            {showSpecs.direccion?.calle || "No especificada"}
                                        </p>
                                        <div className="h-px bg-blue-200/50" />
                                        <p className="text-sm font-bold text-slate-700">
                                            <span className="text-blue-500 uppercase text-[9px] tracking-widest block mb-1">Ciudad / Región</span>
                                            {showSpecs.direccion?.ciudad || "No especificada"}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <button
                            onClick={() => setShowSpecs(null)}
                            className="mt-12 w-full rounded-[1.5rem] bg-slate-950 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl hover:bg-orange-500 transition-all active:scale-95"
                        >
                            Cerrar Expediente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
