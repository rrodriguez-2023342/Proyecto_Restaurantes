import { create } from "zustand";
import { createUser, getUsers, updateUserRole, updateUser, deleteUser } from "../../../shared/api";

export const useUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getUsers();
            const users = data?.data || data?.users || data || [];
            set({ users, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar usuarios";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createUser: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createUser(payload);
            const newUser = data?.data || data?.user || data;
            set({
                users: [newUser, ...get().users],
                loading: false,
            });
            return newUser;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear usuario";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateUserRole: async (userId, roleName) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateUserRole(userId, roleName);
            const updatedUser = data?.data || data?.user || null;
            set({
                users: get().users.map((user) => {
                    const isTarget = user.id === userId || user._id === userId;
                    if (!isTarget) return user;
                    return {
                        ...user,
                        ...(updatedUser || {}),
                        role: updatedUser?.role || roleName,
                    };
                }),
                loading: false,
            });
            return updatedUser;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar rol";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateUser: async (userId, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateUser(userId, payload);
            const updatedUser = data?.data || data?.user || null;
            set({
                users: get().users.map((user) => {
                    const isTarget = user.id === userId || user._id === userId;
                    if (!isTarget) return user;
                    return {
                        ...user,
                        ...(updatedUser || {}),
                    };
                }),
                loading: false,
            });
            return updatedUser;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar usuario";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteUser: async (userId) => {
        try {
            set({ loading: true, error: null });
            await deleteUser(userId);
            set({
                users: get().users.filter((u) => u.id !== userId && u._id !== userId),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar usuario";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
