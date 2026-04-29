import { create } from "zustand";
import {
    createRestaurant,
    deleteRestaurant,
    getRestaurants,
    updateRestaurant,
} from "../../../shared/api";

export const useRestaurantStore = create((set, get) => ({
    restaurants: [],
    loading: false,
    error: null,

    // Fetch all
    fetchRestaurants: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getRestaurants();
            const restaurants = data?.data || data?.restaurantes || data || [];
            set({ restaurants, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar restaurantes";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Create
    createRestaurant: async (formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createRestaurant(formData);
            const newRestaurant = data?.data || data;
            set({
                restaurants: [newRestaurant, ...get().restaurants],
                loading: false,
            });
            return newRestaurant;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear restaurante";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Update
    updateRestaurant: async (id, formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateRestaurant(id, formData);
            const updatedRestaurant = data?.data || data;
            set({
                restaurants: get().restaurants.map((r) =>
                    r._id === id || r.id === id ? updatedRestaurant : r
                ),
                loading: false,
            });
            return updatedRestaurant;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar restaurante";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Delete
    deleteRestaurant: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteRestaurant(id);
            set({
                restaurants: get().restaurants.filter(
                    (r) => r._id !== id && r.id !== id
                ),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar restaurante";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));
