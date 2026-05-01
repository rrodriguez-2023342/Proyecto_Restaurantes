import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_MESAS_URL ||
    import.meta.env.VITE_RESTAURANTES_URL ||
    "http://localhost:3007/restaurantes/v1";

// ============= MESAS =============

export const getTables = async (params = {}) => {
    return axiosAdmin.get("/mesas", { baseURL: BASE_URL, params });
};

export const getTableById = async (id) => {
    return axiosAdmin.get(`/mesas/${id}`, { baseURL: BASE_URL });
};

export const getTablesByRestaurant = async (restaurantId, params = {}) => {
    return axiosAdmin.get("/mesas", {
        baseURL: BASE_URL,
        params: { limit: 1000, ...params, restaurante: restaurantId },
    });
};

export const createTable = async (payload) => {
    return axiosAdmin.post("/mesas/create", payload, { baseURL: BASE_URL });
};

export const updateTable = async (id, payload) => {
    return axiosAdmin.put(`/mesas/${id}`, payload, { baseURL: BASE_URL });
};

export const deleteTable = async (id) => {
    return axiosAdmin.delete(`/mesas/${id}`, { baseURL: BASE_URL });
};

export const checkTableAvailability = async (payload) => {
    return axiosAdmin.post("/mesas/disponibilidad", payload, { baseURL: BASE_URL });
};
