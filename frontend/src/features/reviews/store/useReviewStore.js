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
            set({ reviews: Array.isArray(reviews) ? reviews : [], loading: false });
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar reseñas";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createReview: async (formData) => {
        try {
            set({ loading: true });
            const { data } = await createReview(formData);
            const newReviewBody = data?.data || data?.resena || data;
            
            // Re-fetch or manually update is fine, but don't set the global 'error'
            // so we don't break the ReviewList UI
            const restaurantId = formData.restaurante;
            if (restaurantId) {
                const { data: refreshedData } = await getReviews({ restaurante: restaurantId });
                const refreshedReviews = refreshedData?.data || refreshedData?.resenas || refreshedData || [];
                set({ 
                    reviews: Array.isArray(refreshedReviews) ? refreshedReviews : [],
                    loading: false 
                });
            } else {
                set({ loading: false });
            }
            
            return newReviewBody;
        } catch (err) {
            set({ loading: false });
            throw err; // Re-throw to be handled by the form toast
        }
    },

    updateReview: async (id, formData) => {
        try {
            set({ loading: true });
            const { data } = await updateReview(id, formData);
            const updatedReviewBody = data?.data || data?.resena || data;
            
            set((state) => ({
                reviews: (Array.isArray(state.reviews) ? state.reviews : []).map((r) =>
                    r._id === id || r.id === id ? { ...r, ...updatedReviewBody } : r
                ),
                loading: false,
            }));
            return updatedReviewBody;
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    deleteReview: async (id) => {
        try {
            set({ loading: true });
            await deleteReview(id);
            set((state) => ({
                reviews: (Array.isArray(state.reviews) ? state.reviews : []).filter(
                    (r) => r._id !== id && r.id !== id
                ),
                loading: false,
            }));
        } catch (err) {
            set({ loading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
}));
