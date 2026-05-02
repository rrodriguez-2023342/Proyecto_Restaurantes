import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_PEDIDOS_URL || "http://localhost:3008/restaurantes/v1";

export const getOrders = async (params = {}) => {
    return axiosAdmin.get("/pedidos", { baseURL: BASE_URL, params: { limit: 500, ...params } });
};

export const getOrderById = async (id) => {
    return axiosAdmin.get(`/pedidos/${id}`, { baseURL: BASE_URL });
};

export const createOrder = async (payload) => {
    return axiosAdmin.post("/pedidos/create", payload, { baseURL: BASE_URL });
};

export const updateOrder = async (id, payload) => {
    return axiosAdmin.put(`/pedidos/${id}`, payload, { baseURL: BASE_URL });
};

export const deleteOrder = async (id) => {
    return axiosAdmin.delete(`/pedidos/${id}`, { baseURL: BASE_URL });
};
