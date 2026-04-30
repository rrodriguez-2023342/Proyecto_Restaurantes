import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    login as loginRequest,
    register as registerRequest,
    forgotPassword as forgotPasswordRequest,
    resetPassword as resetPasswordRequest
} from "../../../shared/api"

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,

            checkAuth: () => {
                const token = get().token;

                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token)
                })
            },

            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await loginRequest({ emailOrUsername, password })
                    const accessToken = data.accessToken || data.token;

                    set({
                        user: data.userDetails || null,
                        token: accessToken || null,
                        refreshToken: data.refreshToken || null,
                        expiresAt: data.expiresAt || null,
                        loading: false,
                        error: null,
                        isAuthenticated: Boolean(accessToken),
                    })

                    return { success: true }

                } catch (err) {
                    console.error("Login error:", err);
                    const message =
                        err.response?.data?.message || "Error de autenticación";
                    set({ error: message, loading: false })
                    return { success: false, error: message }
                }
            },

            register: async (formData) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await registerRequest(formData);
                    set({ loading: false });
                    return { 
                        success: true,
                        emailVerificationRequired: data?.emailVerificationRequired,
                        data,
                    }
                } catch (err) {
                    const message = err.response?.data?.message || "Error al registrarse";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            forgotPassword: async (email) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await forgotPasswordRequest(email);
                    set({ loading: false });
                    return {
                        success: true,
                        message: data?.message || "Se ha enviado un enlace de recuperación a tu email"
                    }
                } catch (err) {
                    const message = err.response?.data?.message || "Error al solicitar recuperación de contraseña";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            resetPassword: async (token, newPassword) => {
                try {
                    set({ loading: true, error: null });
                    const { data } = await resetPasswordRequest(token, newPassword);
                    set({ loading: false });
                    return {
                        success: true,
                        message: data?.message || "Contraseña actualizada exitosamente"
                    }
                } catch (err) {
                    const message = err.response?.data?.message || "Error al cambiar la contraseña";
                    set({ error: message, loading: false });
                    return { success: false, error: message };
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false
                })
            }
        }),
        { name: "auth-storage" }
    )
)