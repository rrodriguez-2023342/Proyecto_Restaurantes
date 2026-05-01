import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_PEDIDOS_URL || "http://localhost:3008/restaurantes/v1";

export const getDetailOrders = async (params = {}) => {
    return axiosAdmin.get("/detalle-pedidos", { baseURL: BASE_URL, params });
};

export const getDetailOrderById = async (id) => {
    return axiosAdmin.get(`/detalle-pedidos/${id}`, { baseURL: BASE_URL });
};

export const getDetailOrdersByOrderId = async (orderId) => {
    return axiosAdmin.get(`/detalle-pedidos/pedido/${orderId}`, {
        baseURL: BASE_URL,
    });
};

export const createDetailOrder = async (payload) => {
    return axiosAdmin.post("/detalle-pedidos/create", payload, { baseURL: BASE_URL });
};

export const updateDetailOrder = async (id, payload) => {
    return axiosAdmin.put(`/detalle-pedidos/${id}`, payload, { baseURL: BASE_URL });
};

export const deleteDetailOrder = async (id) => {
    return axiosAdmin.delete(`/detalle-pedidos/${id}`, { baseURL: BASE_URL });
};
