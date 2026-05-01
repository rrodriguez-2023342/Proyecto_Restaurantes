import { axiosAdmin } from "./api.js";

const BASE_URL =
    import.meta.env.VITE_REPORTES_URL || "http://localhost:3008/restaurantes/v1";

export const getDashboardStats = async (params = {}) => {
    return axiosAdmin.get("/reportes/dashboard", { baseURL: BASE_URL, params });
};

export const exportReportCSV = async (params = {}) => {
    return axiosAdmin.get("/reportes/export/csv", { 
        baseURL: BASE_URL, 
        params,
        responseType: 'blob' 
    });
};

export const exportReportPDF = async (params = {}) => {
    return axiosAdmin.get("/reportes/export/pdf", { 
        baseURL: BASE_URL, 
        params,
        responseType: 'blob' 
    });
};
