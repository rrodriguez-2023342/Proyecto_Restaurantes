import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_RESERVACIONES_URL ||
    import.meta.env.VITE_PEDIDOS_URL ||
    "http://localhost:3008/restaurantes/v1";

// ============= RESERVACIONES =============

const rejectBusinessError = (response) => {
    if (response.data?.success === false) {
        const error = new Error(response.data.message || "Error al procesar la reservacion");
        error.response = response;
        throw error;
    }

    return response;
};

export const getReservations = async (params = {}) => {
    return axiosAdmin.get("/reservaciones", { baseURL: BASE_URL, params });
};

export const getReservationById = async (id) => {
    return axiosAdmin.get(`/reservaciones/${id}`, { baseURL: BASE_URL });
};

export const createReservation = async (payload) => {
    const response = await axiosAdmin.post("/reservaciones/create", payload, { baseURL: BASE_URL });
    return rejectBusinessError(response);
};

export const updateReservation = async (id, payload) => {
    const response = await axiosAdmin.put(`/reservaciones/${id}`, payload, { baseURL: BASE_URL });
    return rejectBusinessError(response);
};

export const deleteReservation = async (id) => {
    return axiosAdmin.delete(`/reservaciones/${id}`, { baseURL: BASE_URL });
};

export const getUserReservations = async (_userId, params = {}) => {
    return axiosAdmin.get("/reservaciones", { baseURL: BASE_URL, params });
};

export const getRestaurantReservations = async (restaurantId, params = {}) => {
    return axiosAdmin.get("/reservaciones", {
        baseURL: BASE_URL,
        params: { ...params, restaurante: restaurantId },
    });
};

export const validateReservationAvailability = async (payload) => {
    return axiosAdmin.post("/reservaciones/validar-disponibilidad", payload, { baseURL: BASE_URL });
};
