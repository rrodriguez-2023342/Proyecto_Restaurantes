const RESTAURANTS_URL = process.env.EXPO_PUBLIC_RESTAURANTS_URL || "http://localhost:3007/restaurantes/v1";
const RESERVATIONS_URL = process.env.EXPO_PUBLIC_RESERVACIONES_URL || process.env.EXPO_PUBLIC_PEDIDOS_URL || RESTAURANTS_URL.replace(":3007", ":3008");

export const ENDPOINTS = {
    AUTH: process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:3006/api/v1/auth",
    RESTAURANTS: RESTAURANTS_URL,
    RESERVATIONS: RESERVATIONS_URL,
    FACTURAS: process.env.EXPO_PUBLIC_FACTURAS_URL || RESERVATIONS_URL,
    USER: process.env.EXPO_PUBLIC_USER_URL || (process.env.EXPO_PUBLIC_AUTH_URL ? process.env.EXPO_PUBLIC_AUTH_URL.replace(/\/auth$/, "/users") : "http://localhost:3006/api/v1/users"),
};
