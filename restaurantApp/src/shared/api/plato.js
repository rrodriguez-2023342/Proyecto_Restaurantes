import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getPlatos = async (menuId = null) => {
    const params = menuId ? { menu: menuId } : {};

    return authClient.get("/platos", {
        baseURL: ENDPOINTS.RESTAURANTS,
        params,
    });
};

export const getPlatoById = async (id) => {
    return authClient.get(`/platos/${id}`, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};
