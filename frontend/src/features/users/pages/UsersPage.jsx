import { useEffect, useMemo, useState } from "react";
import { adminTheme } from "../../../constants/theme";
import { Avatar, BadgeEstado, Card, DataTable, EmptyState } from "../../../shared/components";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import { CreateUserModal } from "../components/CreateUserModal.jsx";
import { UserDetailModal } from "../components/UserDetailModal.jsx";
import { useUserStore } from "../store/useUserStore";

const PAGE_SIZE = 8;

export const UsersPage = () => {
    const currentUser = useAuthStore((state) => state.user);
    const { users, loading, fetchUsers, createUser: storeCreate, updateUserRole: storeUpdateRole, deleteUser: storeDelete } = useUserStore();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers().catch((err) => showError(err.response?.data?.message || "No se pudieron cargar los usuarios"));
    }, [fetchUsers]);

    const getFullName = (user) => [user.name, user.surname].filter(Boolean).join(" ") || "Usuario";

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return users.filter((user) => {
            const fullName = getFullName(user).toLowerCase();
            const username = (user.username || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            const role = (user.role || "").toUpperCase();
            const matchesSearch = !normalizedSearch || fullName.includes(normalizedSearch) || username.includes(normalizedSearch) || email.includes(normalizedSearch);
            const matchesRole = roleFilter === "ALL" || roleFilter === role;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filteredUsers, currentPage]);

    const handleCreate = async (payload) => {
        try {
            await storeCreate(payload);
            showSuccess("Usuario creado");
            return true;
        } catch (err) {
            showError(err.response?.data?.message || "No se pudo crear el usuario");
            return false;
        }
    };

    const handleSaveRole = async (user, newRole) => {
        try {
            await storeUpdateRole(user.id || user._id, newRole);
            showSuccess("Rol actualizado correctamente");
            setSelectedUser(null);
        } catch {
            showError("No se pudo actualizar el rol");
        }
    };

    const handleUpdateUser = async (userId, payload) => {
        try {
            const target = users.find((user) => user.id === userId || user._id === userId);
            const isCurrentUser = userId === currentUser?.id || userId === currentUser?._id;
            if (target?.role === "ADMIN_ROLE" && !isCurrentUser) {
                showError("No puedes editar a otro administrador");
                return false;
            }
            await useUserStore.getState().updateUser(userId, payload);
            showSuccess("Usuario actualizado");
            setSelectedUser(null);
            return true;
        } catch (err) {
            showError(err.response?.data?.message || "No se pudo actualizar el usuario");
            return false;
        }
    };

    const handleDelete = async (user) => {
        const userId = user.id || user._id;
        if (userId === currentUser?.id) {
            showError("No puedes eliminarte a ti mismo");
            return;
        }
        if (user.role === "ADMIN_ROLE") {
            showError("No puedes eliminar a otro administrador");
            return;
        }
        if (!confirm(`Estas seguro de eliminar a ${getFullName(user)}?`)) return;
        try {
            await storeDelete(userId);
            showSuccess("Usuario eliminado");
        } catch {
            showError("No se pudo eliminar el usuario");
        }
    };

    const columns = [
        {
            key: "user",
            header: "Usuario",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar src={user.profilePicture} name={getFullName(user)} size={40} />
                    <div>
                        <p className="font-semibold text-slate-900">{getFullName(user)}</p>
                        <p className="text-xs text-slate-500">@{user.username || "usuario"}</p>
                    </div>
                </div>
            ),
        },
        { key: "email", header: "Email", render: (user) => user.email || "N/A" },
        { key: "phone", header: "Telefono", render: (user) => user.phone || "N/A" },
        { key: "role", header: "Rol", render: (user) => <BadgeEstado value={user.role || "USER_ROLE"} /> },
        {
            key: "actions",
            header: "Acciones",
            render: (user) => {
                const userId = user.id || user._id;
                const isCurrentUser = userId === currentUser?.id || userId === currentUser?._id;
                const isProtectedAdmin = user.role === "ADMIN_ROLE" && !isCurrentUser;

                if (isProtectedAdmin) {
                    return (
                        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            Administrador protegido
                        </span>
                    );
                }

                return (
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setSelectedUser(user)} className="rounded-lg border border-orange-500/30 bg-white px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-50">
                            Editar
                        </button>
                        {!isCurrentUser && (
                            <button type="button" onClick={() => handleDelete(user)} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600">
                                Eliminar
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="admin-surface rounded-lg p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="admin-kicker">Gobierno de acceso</p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">Gestión de Usuarios</h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">Administra usuarios, revisa su información y cambia roles.</p>
                </div>
                <button 
                    type="button" 
                    onClick={() => setOpenCreate(true)} 
                    className="w-full rounded-lg bg-slate-950 px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-slate-900/10 transition-all hover:!bg-amber-500 hover:!text-slate-950 active:scale-95 sm:w-auto"
                >
                    + Agregar usuario
                </button>
            </div>
            </div>

            <Card title="Búsqueda y Filtros">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Nombre, usuario o email..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <select
                            value={roleFilter}
                            onChange={(event) => {
                                setRoleFilter(event.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="ALL">Todos los roles</option>
                            <option value="ADMIN_ROLE">Super Admin</option>
                            <option value="ADMIN_RESTAURANT_ROLE">Admin Restaurante</option>
                            <option value="USER_ROLE">Usuario Cliente</option>
                        </select>
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />)}
                    </div>
                </div>
            ) : filteredUsers.length ? (
                <DataTable columns={columns} rows={paginatedUsers} rowKey="_id" emptyLabel="No hay usuarios" />
            ) : (
                <EmptyState title="No hay usuarios" description="Crea el primer usuario desde el boton superior." />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Mostrando {paginatedUsers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} -
                    {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
                </span>
                <div className="flex w-full sm:w-auto gap-2">
                    <button 
                        type="button" 
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))} 
                        disabled={currentPage === 1} 
                        className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} 
                        disabled={currentPage === totalPages} 
                        className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <CreateUserModal isOpen={openCreate} onClose={() => setOpenCreate(false)} onCreate={handleCreate} loading={loading} />
            <UserDetailModal
                isOpen={Boolean(selectedUser)}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                loading={loading}
                currentUserId={currentUser?.id}
                onSaveRole={handleSaveRole}
                onUpdateUser={handleUpdateUser}
            />
        </div>
    );
};
