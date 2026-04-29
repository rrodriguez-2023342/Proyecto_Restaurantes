import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const getReviews = async (params = {}) => {
    return axiosAdmin.get("/resenas", { baseURL: BASE_URL, params });
};

export const createReview = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/resenas/create", payload, { baseURL: BASE_URL, ...config });
};

export const updateReview = async (id, payload) => {
    return axiosAdmin.put(`/resenas/${id}`, payload, { baseURL: BASE_URL });
};

export const deleteReview = async (id) => {
    return axiosAdmin.delete(`/resenas/${id}`, { baseURL: BASE_URL });
};
