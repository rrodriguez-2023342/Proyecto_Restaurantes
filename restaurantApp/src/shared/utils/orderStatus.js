import { COLORS } from "../constants/theme";

// Normaliza el estado del pedido: quita acentos, pasa a minusculas y limpia.
export const normalizeStatus = (status) =>
    String(status || "pendiente")
        .toLowerCase()
        .replace(/[áàä]/g, "a")
        .replace(/[éèë]/g, "e")
        .replace(/[íìï]/g, "i")
        .replace(/[óòö]/g, "o")
        .replace(/[úùü]/g, "u")
        .replace(/_/g, " ")
        .trim();

// Devuelve el paso del seguimiento (0..3) segun el estado.
export const getTrackingStep = (status) => {
    const s = normalizeStatus(status);
    if (s === "entregado") return 3;
    if (s === "en camino" || s === "listo para entrega" || s === "listo") return 2;
    if (s === "en preparacion" || s === "confirmado") return 1;
    return 0;
};

export const isDeliveredStatus = (status) => normalizeStatus(status) === "entregado";
export const isCancelledStatus = (status) => normalizeStatus(status) === "cancelado";
export const isPendingStatus = (status) => normalizeStatus(status) === "pendiente";

// Config visual de cada estado (etiqueta, color, fondo, icono).
export const getStatusConfig = (status) => {
    const s = normalizeStatus(status);
    switch (s) {
        case "entregado":
            return { label: "Entregado", color: "#16a34a", bg: "#f0fdf4", icon: "checkmark-circle-outline" };
        case "cancelado":
            return { label: "Cancelado", color: "#e11d48", bg: "#fff1f2", icon: "close-circle-outline" };
        case "en preparacion":
        case "confirmado":
            return { label: "En preparacion", color: "#ea580c", bg: "#fff7ed", icon: "restaurant-outline" };
        case "en camino":
        case "listo para entrega":
        case "listo":
            return { label: "En camino", color: "#2563eb", bg: "#eff6ff", icon: "bicycle-outline" };
        default:
            return { label: "Pendiente", color: COLORS.accent, bg: COLORS.accentSoft, icon: "time-outline" };
    }
};

// Pasos del seguimiento para la linea de tiempo.
export const TRACKING_STEPS = [
    { key: "received", title: "Recibido", description: "Tu pedido fue registrado por el restaurante.", icon: "receipt-outline" },
    { key: "preparing", title: "Preparando", description: "La cocina ya esta trabajando en tus platos.", icon: "restaurant-outline" },
    { key: "delivery", title: "En camino", description: "Tu pedido salio rumbo a tu direccion.", icon: "bicycle-outline" },
    { key: "delivered", title: "Entregado", description: "Pedido finalizado y entregado con exito.", icon: "home-outline" },
];

// Filtros disponibles en "Mis pedidos".
export const ORDER_FILTERS = [
    { key: "all", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en preparacion", label: "En preparacion" },
    { key: "entregado", label: "Entregados" },
    { key: "cancelado", label: "Cancelados" },
];

// Indica si un pedido pasa el filtro seleccionado.
export const matchesFilter = (status, filterKey) => {
    if (filterKey === "all") return true;
    const s = normalizeStatus(status);
    if (filterKey === "en preparacion") return s === "en preparacion" || s === "confirmado";
    return s === filterKey;
};
