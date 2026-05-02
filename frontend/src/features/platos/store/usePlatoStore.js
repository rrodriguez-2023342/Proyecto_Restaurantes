import { create } from "zustand";
import {
    createPlato,
    deletePlato,
    getPlatos,
    updatePlato,
} from "../../../shared/api";

export const usePlatoStore = create((set, get) => ({
    platos: [],
    loading: false,
    error: null,

    fetchPlatos: async (menuId) => {
        try {
            set({ loading: true, error: null });
            if (!menuId) {
                set({ platos: [], loading: false });
                return [];
            }
            const { data } = await getPlatos(menuId);
            const platos = data?.data || data?.platos || data || [];
            set({ platos, loading: false });
            return platos;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar platos";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createPlato: async (formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createPlato(formData);
            const newPlato = data?.data || data;
            set({ platos: [newPlato, ...get().platos], loading: false });
            return newPlato;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear el plato";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updatePlato: async (id, formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updatePlato(id, formData);
            const updatedPlato = data?.data || data;
            set({
                platos: get().platos.map((item) =>
                    item._id === id || item.id === id ? updatedPlato : item
                ),
                loading: false,
            });
            return updatedPlato;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar el plato";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deletePlato: async (id) => {
        try {
            set({ loading: true, error: null });
            await deletePlato(id);
            set({
                platos: get().platos.filter((item) => item._id !== id && item.id !== id),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar el plato";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
