export const ENDPOINTS = {
    AUTH: process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:3006/api/v1/auth",
    RESTAURANTS: process.env.EXPO_PUBLIC_RESTAURANTS_URL || "http://localhost:3007/restaurantes/v1",
    USER: process.env.EXPO_PUBLIC_USER_URL || (process.env.EXPO_PUBLIC_AUTH_URL ? process.env.EXPO_PUBLIC_AUTH_URL.replace(/\/auth$/, "/users") : "http://localhost:3006/api/v1/users"),
};