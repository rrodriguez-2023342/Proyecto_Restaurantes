import authClient from "./authClient.js";
import { ENDPOINTS } from "../constants/endpoints";

export const getInvoices = async (params = {}) => {
    return authClient.get("/facturas", {
        baseURL: ENDPOINTS.FACTURAS,
        params,
    });
};

export const getInvoiceById = async (id) => {
    return authClient.get(`/facturas/${id}`, {
        baseURL: ENDPOINTS.FACTURAS,
    });
};

export const sendInvoiceByEmail = async (id) => {
    return authClient.get(`/facturas/${id}/pdf`, {
        baseURL: ENDPOINTS.FACTURAS,
        responseType: "arraybuffer",
    });
};
