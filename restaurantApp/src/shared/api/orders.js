import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

const rejectBusinessError = (response) => {
    if (response.data?.success === false) {
        const error = new Error(response.data.message || "Error al procesar el pedido");
        error.response = response;
        throw error;
    }

    return response;
};

export const createOrder = async (payload) => {
    const response = await authClient.post("/pedidos/create", payload, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });

    return rejectBusinessError(response);
};

export const getOrders = async (params = {}) => {
    return authClient.get("/pedidos", {
        baseURL: ENDPOINTS.RESERVATIONS,
        params,
    });
};

export const getOrderById = async (id) => {
    return authClient.get(`/pedidos/${id}`, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });
};

export const updateOrder = async (id, payload) => {
    const response = await authClient.put(`/pedidos/${id}`, payload, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });

    return rejectBusinessError(response);
};

export const cancelOrder = async (id) => {
    const response = await authClient.put(
        `/pedidos/${id}`,
        { estadoPedido: "Cancelado" },
        {
            baseURL: ENDPOINTS.RESERVATIONS,
        }
    );

    return rejectBusinessError(response);
};

export const getOrderDetailByOrderId = async (orderId) => {
    return authClient.get(`/detalle-pedidos/pedido/${orderId}`, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });
};
