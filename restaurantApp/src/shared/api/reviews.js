import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getReviews = async (params = {}) => {
    return authClient.get("/resenas", {
        baseURL: ENDPOINTS.RESTAURANTS,
        params,
    });
};

export const createReview = async (payload) => {
    return authClient.post("/resenas/create", payload, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};

export const updateReview = async (id, payload) => {
    return authClient.put(`/resenas/${id}`, payload, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};

export const deleteReview = async (id) => {
    return authClient.delete(`/resenas/${id}`, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};
