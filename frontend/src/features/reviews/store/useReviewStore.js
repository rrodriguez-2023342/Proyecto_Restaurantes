import { create } from "zustand";
import {
    createReview,
    deleteReview,
    getReviews,
    updateReview,
} from "../../../shared/api";

export const useReviewStore = create((set, get) => ({
    reviews: [],
    loading: false,
    error: null,

    fetchReviews: async (filters = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getReviews(filters);
            const reviews = data?.data || data?.resenas || data || [];
            set({ reviews, loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar reseñas";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createReview: async (formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createReview(formData);
            const newReview = data?.data || data;
            set({
                reviews: [newReview, ...get().reviews],
                loading: false,
            });
            return newReview;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear reseña";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateReview: async (id, formData) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateReview(id, formData);
            const updatedReview = data?.data || data;
            set({
                reviews: get().reviews.map((r) =>
                    r._id === id || r.id === id ? updatedReview : r
                ),
                loading: false,
            });
            return updatedReview;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar reseña";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteReview: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteReview(id);
            set({
                reviews: get().reviews.filter(
                    (r) => r._id !== id && r.id !== id
                ),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar reseña";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
