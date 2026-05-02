import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_REPORTES_URL || "http://localhost:3009/restaurantes/v1";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params || {}).filter(([, value]) => value !== null && value !== undefined && value !== '')
    );

export const getDashboardStats = async (params = {}) => {
    return axiosAdmin.get("/reportes/dashboard", { baseURL: BASE_URL, params: cleanParams(params) });
};

export const exportReportCSV = async (params = {}) => {
    return axiosAdmin.get("/reportes/export/csv", { 
        baseURL: BASE_URL, 
        params: cleanParams(params),
        responseType: 'blob' 
    });
};

export const exportReportPDF = async (params = {}) => {
    return axiosAdmin.get("/reportes/export/pdf", { 
        baseURL: BASE_URL, 
        params: cleanParams(params),
        responseType: 'blob' 
    });
};
