import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const getMenus = async (params = {}) => {
    return axiosAdmin.get("/menus", { baseURL: BASE_URL, params });
};

export const getMenuById = async (id) => {
    return axiosAdmin.get(`/menus/${id}`, { baseURL: BASE_URL });
};

export const createMenu = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/menus/create", payload, { baseURL: BASE_URL, ...config });
};

export const updateMenu = async (id, payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.put(`/menus/${id}`, payload, { baseURL: BASE_URL, ...config });
};

export const deleteMenu = async (id) => {
    return axiosAdmin.delete(`/menus/${id}`, { baseURL: BASE_URL });
};
