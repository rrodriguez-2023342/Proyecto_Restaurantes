import { create } from "zustand";
import {
    createMenu,
    deleteMenu,
    getMenus,
    updateMenu,
} from "../../../shared/api";

export const useMenuStore = create((set, get) => ({
    menus: [],
    loading: false,
    error: null,

    fetchMenus: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getMenus();
            const menus = data?.data || data?.menus || data || [];
            set({ menus, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar menús";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createMenu: async (formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createMenu(formData);
            const newMenu = data?.data || data;
            set({
                menus: [newMenu, ...get().menus],
                loading: false,
            });
            return newMenu;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear menu";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateMenu: async (id, formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateMenu(id, formData);
            const updatedMenu = data?.data || data;
            set({
                menus: get().menus.map((m) =>
                    m._id === id || m.id === id ? updatedMenu : m
                ),
                loading: false,
            });
            return updatedMenu;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar menu";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteMenu: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteMenu(id);
            set({
                menus: get().menus.filter(
                    (m) => m._id !== id && m.id !== id
                ),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar menu";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
