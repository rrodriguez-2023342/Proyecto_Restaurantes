import { create } from "zustand";
import {
    createInventario,
    deleteInventario,
    getInventarios,
    updateInventario,
} from "../../../shared/api/inventory";

export const useInventoryStore = create((set, get) => ({
    inventarios: [],
    loading: false,
    error: null,
    pagination: null,

    fetchInventarios: async (page = 1, limit = 50, restaurante = "") => {
        try {
            set({ loading: true, error: null });
            const { data } = await getInventarios(page, limit, restaurante);
            set({ 
                inventarios: data?.data || [], 
                pagination: data?.pagination || null,
                loading: false 
            });
            return data?.data || [];
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar inventarios";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createItem: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createInventario(payload);
            const newItem = data?.data || data;
            set({ 
                inventarios: [newItem, ...get().inventarios], 
                loading: false 
            });
            return newItem;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear ítem";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateItem: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateInventario(id, payload);
            const updatedItem = data?.data || data;
            set({
                inventarios: get().inventarios.map((item) =>
                    item._id === id || item.id === id ? updatedItem : item
                ),
                loading: false,
            });
            return updatedItem;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar ítem";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteItem: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteInventario(id);
            set({
                inventarios: get().inventarios.filter((item) => item._id !== id && item.id !== id),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar ítem";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
