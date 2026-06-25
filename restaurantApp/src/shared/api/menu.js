import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getMenus = async (params = {}) => {
    return authClient.get("/menus", {
        baseURL: ENDPOINTS.RESTAURANTS,
        params,
    });
};

export const getMenuById = async (id) => {
    return authClient.get(`/menus/${id}`, {
        baseURL: ENDPOINTS.RESTAURANTS,
    });
};
