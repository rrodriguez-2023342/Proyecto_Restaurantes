import { ENDPOINTS } from "../constants/endpoints";
import { useAuthStore } from "../store/authStore";
import userClient from "./userClient.js";

export const updateUserProfile = async (userId, payload) => {
    if (payload && typeof payload.append === 'function') {
        const token = useAuthStore.getState().token;
        const response = await fetch(`${ENDPOINTS.USER}/${userId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
            body: payload,
        });

        if (!response.ok) {
            let errorMsg = 'Error al actualizar perfil';
            try {
                const errData = await response.json();
                errorMsg = errData.message || errorMsg;
            } catch (e) {}
            const err = new Error(errorMsg);
            err.response = { data: { message: errorMsg } };
            throw err;
        }

        const data = await response.json();
        return { data };
    }

    return userClient.put(`/${userId}`, payload);
};
