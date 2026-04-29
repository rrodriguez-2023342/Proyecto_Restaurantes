import { axiosAdmin } from "./api.js";

const BASE_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:3006/api/v1";

export const getUsers = async () => {
    return axiosAdmin.get("/users", { baseURL: BASE_URL });
};

export const createUser = async (payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.post("/users", payload, { baseURL: BASE_URL, ...config });
};

export const getUsersByRole = async (roleName) => {
    return axiosAdmin.get(`/users/by-role/${roleName}`, { baseURL: BASE_URL });
};

export const updateUserRole = async (userId, roleName) => {
    return axiosAdmin.put(`/users/${userId}/role`, { roleName }, { baseURL: BASE_URL });
};

export const updateUser = async (userId, payload) => {
    const config = payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    return axiosAdmin.put(`/users/${userId}`, payload, { baseURL: BASE_URL, ...config });
};

export const deleteUser = async (userId) => {
    return axiosAdmin.delete(`/users/${userId}`, { baseURL: BASE_URL });
};
