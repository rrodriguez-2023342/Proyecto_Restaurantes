import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESTAURANTES_URL || "http://localhost:3007/restaurantes/v1";

export const createPlato = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/platos/create", payload, { baseURL: BASE_URL, ...config });
};

export const getPlatos = async (menuId) => {
    return axiosAdmin.get("/platos", { baseURL: BASE_URL, params: { menu: menuId } });
};
