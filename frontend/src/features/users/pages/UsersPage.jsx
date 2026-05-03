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
            render: (user) => (
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelectedUser(user)} className="rounded-lg border border-orange-500/30 bg-white px-3 py-1 text-xs font-semibold text-orange-600 transition hover:bg-orange-50">
                        Editar
                    </button>
                    {(user.id !== currentUser?.id && user._id !== currentUser?.id) && (
                        <button type="button" onClick={() => handleDelete(user)} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600">
                            Eliminar
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className={adminTheme.pageTitle}>Usuarios</h2>
                    <p className="mt-1 text-sm text-slate-600">Administra usuarios, revisa su informacion y cambia roles.</p>
                </div>
                <button type="button" onClick={() => setOpenCreate(true)} className={adminTheme.primaryButton}>
                    Agregar usuario
                </button>
            </div>

            <Card title="Filtros">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center">
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Buscar por nombre, usuario o email"
                        className={adminTheme.input}
                    />
                    <select
                        value={roleFilter}
                        onChange={(event) => {
                            setRoleFilter(event.target.value);
                            setPage(1);
                        }}
                        className={adminTheme.select}
                    >
                        <option value="ALL">Todos los roles</option>
                        <option value="ADMIN_ROLE">ADMIN_ROLE</option>
                        <option value="ADMIN_RESTAURANT_ROLE">ADMIN_RESTAURANT_ROLE</option>
                        <option value="USER_ROLE">USER_ROLE</option>
                    </select>
                    <p className="text-sm text-slate-500">Total: {filteredUsers.length}</p>
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

            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                    Mostrando {paginatedUsers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} -
                    {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
                </span>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className={adminTheme.neutralButton}>
                        Anterior
                    </button>
                    <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className={adminTheme.neutralButton}>
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
