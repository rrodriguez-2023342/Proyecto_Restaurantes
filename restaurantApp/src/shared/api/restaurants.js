import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getRestaurants = async (params = {}) => {
    return authClient.get("/restaurantes", {
        baseURL: ENDPOINTS.RESTAURANTS,
        params,
    });
};

export const getRestaurantById = async (id) => {
    return authClient.get(`/restaurantes/${id}`, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};