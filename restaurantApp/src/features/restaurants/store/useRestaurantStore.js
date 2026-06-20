import { create } from "zustand";
import { getRestaurants } from "../../../shared/api/restaurants";

const normalizeRestaurants = (data) => data?.data || data?.restaurantes || data || [];

export const useRestaurantStore = create((set, get) => ({
    restaurants: [],
    loading: false,
    refreshing: false,
    error: null,

    fetchRestaurants: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getRestaurants(params);
            const restaurants = normalizeRestaurants(data);
            set({ restaurants, loading: false });
            return restaurants;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar restaurantes";
            set({ error: message, loading: false });
            throw err;
        }
    },

    refreshRestaurants: async (params = {}) => {
        try {
            set({ refreshing: true, error: null });
            const { data } = await getRestaurants(params);
            const restaurants = normalizeRestaurants(data);
            set({ restaurants, refreshing: false });
            return restaurants;
        } catch (err) {
            const message = err.response?.data?.message || "Error al refrescar restaurantes";
            set({ error: message, refreshing: false });
            throw err;
        }
    },

    clearRestaurants: () => set({ restaurants: [], error: null, loading: false, refreshing: false }),

    getRestaurantById: async (id) => {
        const current = get().restaurants.find((restaurant) => {
            const restaurantId = restaurant?._id || restaurant?.id;
            return restaurantId?.toString() === id?.toString();
        });

        if (current) return current;

        const { data } = await getRestaurants();
        const restaurants = normalizeRestaurants(data);
        const found = restaurants.find((restaurant) => {
            const restaurantId = restaurant?._id || restaurant?.id;
            return restaurantId?.toString() === id?.toString();
        });

        if (found) {
            set({ restaurants });
        }

        return found || null;
    },
}));