import { create } from "zustand";
import {
    createOrder,
    deleteOrder,
    getOrders,
    updateOrder,
} from "../../../shared/api";

const normalizeOrder = (order) => {
    if (!order) return order;

    const orderId = order._id || order.id;
    const status = order.estado || order.estadoPedido || "Pendiente";
    const total = order.total ?? order.totalPedido ?? 0;
    const userValue = order.usuario;

    return {
        ...order,
        id: orderId,
        numeroPedido: order.numeroPedido || orderId?.slice(-6),
        estado: status,
        estadoPedido: order.estadoPedido || status,
        total,
        totalPedido: order.totalPedido ?? total,
        restaurante:
            typeof order.restaurante === "string"
                ? { id: order.restaurante, nombre: order.restaurante }
                : order.restaurante,
        usuario:
            typeof userValue === "string"
                ? { id: userValue, nombre: userValue }
                : userValue,
        fechaPedido: order.fechaPedido || order.createdAt,
    };
};

export const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,

    fetchOrders: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getOrders(params);
            const orders = (data?.data || data?.pedidos || data || []).map(normalizeOrder);
            set({ orders, loading: false });
            return orders;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar pedidos";
            set({ error: message, loading: false });
            throw err;
        }
    },

    clearOrders: () => set({ orders: [], error: null }),

    createOrder: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createOrder(payload);
            const newOrder = normalizeOrder(data?.data || data);
            set({
                orders: [newOrder, ...get().orders],
                loading: false,
            });
            return newOrder;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateOrder: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateOrder(id, payload);
            const updatedOrder = normalizeOrder(data?.data || data);
            set({
                orders: get().orders.map((o) =>
                    o._id === id || o.id === id ? updatedOrder : o
                ),
                loading: false,
            });
            return updatedOrder;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteOrder: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteOrder(id);
            set({
                orders: get().orders.filter(
                    (o) => o._id !== id && o.id !== id
                ),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    getOrderById: (id) => {
        return get().orders.find((o) => o._id === id || o.id === id);
    },
}));
