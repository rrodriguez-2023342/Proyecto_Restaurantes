import { axiosAuth, axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_FACTURAS_URL || "http://localhost:3008/restaurantes/v1";

export const getInvoices = async (params = {}) => {
    return axiosAuth.get("/facturas", { baseURL: BASE_URL, params });
};

export const getInvoiceById = async (id) => {
    return axiosAuth.get(`/facturas/${id}`, { baseURL: BASE_URL });
};

export const downloadInvoicePDF = async (id) => {
    return axiosAuth.get(`/facturas/${id}/pdf`, { 
        baseURL: BASE_URL, 
        responseType: 'blob' 
    });
};
