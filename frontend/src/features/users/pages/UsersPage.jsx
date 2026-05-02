import { useEffect, useMemo, useState } from "react";
import { Avatar, BadgeEstado, Card, EmptyState } from "../../../shared/components";
import { showError, showSuccess } from "../../../shared/utils/toast";
import { CreateUserModal } from "../components/CreateUserModal.jsx";
import { UserDetailModal } from "../components/UserDetailModal.jsx";
import { useAuthStore } from "../../auth/store/authStore";
import { useUserStore } from "../store/useUserStore";

const PAGE_SIZE = 8;

export const UsersPage = () => {
    const currentUser = useAuthStore((state) => state.user);
    const {
        users,
        loading,
        fetchUsers,
        createUser: storeCreate,
        updateUserRole: storeUpdateRole,
        deleteUser: storeDelete,
    } = useUserStore();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers().catch((err) =>
            showError(err.response?.data?.message || "No se pudieron cargar los usuarios")
        );
    }, [fetchUsers]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return users.filter((user) => {
            const fullName = `${user.name || ""} ${user.surname || ""}`.trim().toLowerCase();
            const username = (user.username || "").toLowerCase();
            const role = (user.role || "").toUpperCase();

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                username.includes(normalizedSearch);

            const matchesRole = roleFilter === "ALL" || roleFilter === role;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredUsers.slice(start, start + PAGE_SIZE);
    }, [filteredUsers, currentPage]);

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
        if (!confirm(`¿Estás seguro de eliminar a ${getFullName(user)}?`)) return;
        try {
            await storeDelete(userId);
            showSuccess("Usuario eliminado");
        } catch {
            showError("No se pudo eliminar el usuario");
        }
    };

    const getFullName = (user) =>
        [user.name, user.surname].filter(Boolean).join(" ") || "Usuario";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Usuarios</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Administra usuarios, revisa su informacion y cambia roles.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpenCreate(true)}
                        className="rounded-full bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition"
                    >
                        + Agregar usuario
                    </button>
                </div>
            </div>

            <Card title="Filtros">
                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nombre o username"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                    />
                    <select
                        value={roleFilter}
                        onChange={(event) => {
                            setRoleFilter(event.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                        <option value="ALL">Todos los roles</option>
                        <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                        <option value="USER_ROLE">USER_ROLE</option>
                    </select>
                    <div className="text-xs text-slate-500 flex items-center">
                        Total: {filteredUsers.length}
                    </div>
                </div>
            </Card>

            {loading ? (
                <Card>
                    <p className="text-sm text-slate-500">Cargando usuarios...</p>
                </Card>
            ) : filteredUsers.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedUsers.map((user) => (
                        <div
                            key={user.id || user._id}
                            className="group relative flex flex-col items-center overflow-hidden rounded-2xl bg-white p-6 shadow-md transition-all duration-500 hover:shadow-2xl"
                        >
                            {/* Avatar section */}
                            <div className="mb-4 transition-all duration-500 group-hover:scale-110">
                                <Avatar
                                    src={user.profilePicture}
                                    name={getFullName(user)}
                                    size={80}
                                    className="border-4 border-orange-50 shadow-sm"
                                />
                            </div>

                            {/* Info section - moves up on hover */}
                            <div className="text-center transition-all duration-500 group-hover:mb-12">
                                <h3 className="text-lg font-bold text-slate-800">
                                    {getFullName(user)}
                                </h3>
                                <p className="text-sm font-medium text-orange-500">@{user.username}</p>
                                <div className="mt-2 flex justify-center gap-2">
                                    <BadgeEstado value={user.role || "USER_ROLE"} />
                                </div>
                                {user.email && (
                                    <p className="mt-1 text-[10px] text-slate-400 truncate max-w-[150px]">
                                        {user.email}
                                    </p>
                                )}
                            </div>

                            {/* Actions bar - slides up from bottom */}
                            <div className="absolute -bottom-full flex w-full items-center justify-center gap-3 bg-gradient-to-t from-orange-50/90 to-transparent pb-4 pt-8 transition-all duration-500 group-hover:bottom-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(user)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-orange-600"
                                    title="Ver / Editar"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                
                                {user.id !== currentUser?.id && user._id !== currentUser?.id && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-rose-600"
                                        title="Eliminar"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No hay usuarios"
                    description="Crea el primer usuario desde el boton superior."
                />
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                    Mostrando {paginatedUsers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} -
                    {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            <CreateUserModal
                isOpen={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreate={handleCreate}
                loading={loading}
            />

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
