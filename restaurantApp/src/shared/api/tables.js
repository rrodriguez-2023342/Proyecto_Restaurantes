import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getTablesByRestaurant = async (restaurantId, params = {}) => {
    return authClient.get("/mesas", {
        baseURL: ENDPOINTS.RESTAURANTS,
        params: { limit: 1000, ...params, restaurante: restaurantId },
    });
};
