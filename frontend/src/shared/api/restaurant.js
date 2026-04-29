import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const getRestaurants = async (params = {}) => {
    return axiosAdmin.get("/restaurantes", { baseURL: BASE_URL, params });
};

export const getRestaurantById = async (id) => {
    return axiosAdmin.get(`/restaurantes/${id}`, { baseURL: BASE_URL });
};

export const createRestaurant = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/restaurantes/create", payload, { baseURL: BASE_URL, ...config });
};

export const updateRestaurant = async (id, payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.put(`/restaurantes/${id}`, payload, { baseURL: BASE_URL, ...config });
};

export const deleteRestaurant = async (id) => {
    return axiosAdmin.delete(`/restaurantes/${id}`, { baseURL: BASE_URL });
};
