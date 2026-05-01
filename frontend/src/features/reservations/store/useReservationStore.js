import { create } from "zustand";
import {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getUserReservations,
    getRestaurantReservations,
} from "../../../shared/api/reservation";

export const useReservationStore = create((set, get) => ({
    reservations: [],
    userReservations: [],
    restaurantReservations: [],
    currentReservation: null,
    loading: false,
    error: null,

    // Fetch all reservations (admin)
    fetchReservations: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getReservations(params);
            const reservations = data?.data || data?.reservaciones || data || [];
            set({ reservations, loading: false });
            return reservations;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar reservaciones";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Fetch user reservations
    fetchUserReservations: async (userId, params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getUserReservations(userId, params);
            const userReservations = data?.data || data?.reservaciones || data || [];
            set({ userReservations, loading: false });
            return userReservations;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar tus reservaciones";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Fetch restaurant reservations
    fetchRestaurantReservations: async (restaurantId, params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getRestaurantReservations(restaurantId, params);
            const restaurantReservations = data?.data || data?.reservaciones || data || [];
            set({ restaurantReservations, loading: false });
            return restaurantReservations;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar reservaciones del restaurante";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Get single reservation
    fetchReservationById: async (id) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getReservationById(id);
            const currentReservation = data?.data || data;
            set({ currentReservation, loading: false });
            return currentReservation;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar la reservación";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Create reservation
    createReservation: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createReservation(payload);
            const newReservation = data?.data || data;
            set({
                reservations: [newReservation, ...get().reservations],
                userReservations: [newReservation, ...get().userReservations],
                loading: false,
            });
            return newReservation;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear la reservación";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Update reservation
    updateReservation: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateReservation(id, payload);
            const updatedReservation = data?.data || data;
            set({
                reservations: get().reservations.map((r) =>
                    r._id === id || r.id === id ? updatedReservation : r
                ),
                userReservations: get().userReservations.map((r) =>
                    r._id === id || r.id === id ? updatedReservation : r
                ),
                restaurantReservations: get().restaurantReservations.map((r) =>
                    r._id === id || r.id === id ? updatedReservation : r
                ),
                currentReservation:
                    get().currentReservation?._id === id || get().currentReservation?.id === id
                        ? updatedReservation
                        : get().currentReservation,
                loading: false,
            });
            return updatedReservation;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar la reservación";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Delete reservation
    deleteReservation: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteReservation(id);
            set({
                reservations: get().reservations.filter((r) => r._id !== id && r.id !== id),
                userReservations: get().userReservations.filter((r) => r._id !== id && r.id !== id),
                restaurantReservations: get().restaurantReservations.filter((r) => r._id !== id && r.id !== id),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar la reservación";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear current reservation
    clearCurrentReservation: () => set({ currentReservation: null }),
}));
