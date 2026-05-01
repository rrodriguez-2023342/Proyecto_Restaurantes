import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const createPlato = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/platos/create", payload, { baseURL: BASE_URL, ...config });
};

export const getPlatos = async (menuId = null) => {
    const params = menuId ? { menu: menuId } : {};
    return axiosAdmin.get("/platos", { baseURL: BASE_URL, params });
};

export const getPlayoById = async (id) => {
    return axiosAdmin.get(`/platos/${id}`, { baseURL: BASE_URL });
};

export const updatePlato = async (id, payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.put(`/platos/${id}`, payload, { baseURL: BASE_URL, ...config });
};

export const deletePlato = async (id) => {
    return axiosAdmin.delete(`/platos/${id}`, { baseURL: BASE_URL });
};
