import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

const rejectBusinessError = (response) => {
    if (response.data?.success === false) {
        const error = new Error(response.data.message || "Error al procesar la reservacion");
        error.response = response;
        throw error;
    }

    return response;
};

export const createReservation = async (payload) => {
    const response = await authClient.post("/reservaciones/create", payload, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });

    return rejectBusinessError(response);
};

export const getReservations = async (params = {}) => {
    return authClient.get("/reservaciones", {
        baseURL: ENDPOINTS.RESERVATIONS,
        params,
    });
};

export const cancelReservation = async (id) => {
    const response = await authClient.put(
        `/reservaciones/${id}`,
        { estado: "CANCELADA" },
        {
            baseURL: ENDPOINTS.RESERVATIONS,
        }
    );

    return rejectBusinessError(response);
};

export const updateReservation = async (id, payload) => {
    const response = await authClient.put(`/reservaciones/${id}`, payload, {
        baseURL: ENDPOINTS.RESERVATIONS,
    });

    return rejectBusinessError(response);
};
