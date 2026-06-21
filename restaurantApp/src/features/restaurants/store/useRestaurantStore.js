import { create } from "zustand";
import { getRestaurants } from "../../../shared/api/restaurants";

const normalizeRestaurants = (data) => data?.data || data?.restaurantes || data || [];

export const useRestaurantStore = create((set, get) => ({
    restaurants: [],
    loading: false,
    refreshing: false,
    error: null,
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,

    fetchRestaurants: async (params = {}) => {
        try {
            const page = Number(params.page || get().page || 1);
            const limit = Number(params.limit || get().limit || 6);
            set({ loading: true, error: null });
            const { data } = await getRestaurants({ ...params, page, limit });
            const restaurants = normalizeRestaurants(data);
            const total = Number(data?.total || data?.meta?.total || restaurants.length);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            set({ restaurants, loading: false, page, limit, total, totalPages });
            return restaurants;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar restaurantes";
            set({ error: message, loading: false });
            throw err;
        }
    },

    refreshRestaurants: async (params = {}) => {
        try {
            const page = Number(params.page || get().page || 1);
            const limit = Number(params.limit || get().limit || 6);
            set({ refreshing: true, error: null });
            const { data } = await getRestaurants({ ...params, page, limit });
            const restaurants = normalizeRestaurants(data);
            const total = Number(data?.total || data?.meta?.total || restaurants.length);
            const totalPages = Math.max(1, Math.ceil(total / limit));
            set({ restaurants, refreshing: false, page, limit, total, totalPages });
            return restaurants;
        } catch (err) {
            const message = err.response?.data?.message || "Error al refrescar restaurantes";
            set({ error: message, refreshing: false });
            throw err;
        }
    },

    setPage: (page) => set({ page }),

    clearRestaurants: () => set({ restaurants: [], error: null, loading: false, refreshing: false, page: 1, limit: 6, total: 0, totalPages: 1 }),

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