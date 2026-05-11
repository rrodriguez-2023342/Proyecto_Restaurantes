import { axiosAdmin } from "./api.js";

const BASE_URL = import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const getInventarios = async (page = 1, limit = 50, restaurante = "") => {
    return await axiosAdmin.get("/inventarios", { 
        baseURL: BASE_URL,
        params: { page, limit, restaurante } 
    });
};

export const createInventario = async (data) => {
    return await axiosAdmin.post("/inventarios/create", data, { baseURL: BASE_URL });
};

export const updateInventario = async (id, data) => {
    return await axiosAdmin.put(`/inventarios/${id}`, data, { baseURL: BASE_URL });
};

export const deleteInventario = async (id) => {
    return await axiosAdmin.delete(`/inventarios/${id}`, { baseURL: BASE_URL });
};
