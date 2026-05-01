import { create } from "zustand";
import {
    createDetailOrder,
    deleteDetailOrder,
    getDetailOrders,
    getDetailOrdersByOrderId,
    updateDetailOrder,
} from "../../../shared/api";

const normalizeDetailOrders = (payload) => {
    const details = Array.isArray(payload) ? payload : payload ? [payload] : [];

    return details.flatMap((detail) => {
        const detailId = detail.detallePedidoId || detail._id || detail.id;
        const pedidoValue = detail.pedido;
        const pedido =
            typeof pedidoValue === "string"
                ? {
                    id: pedidoValue,
                    _id: pedidoValue,
                    numeroPedido: pedidoValue.slice(-6),
                }
                : pedidoValue
                    ? {
                        ...pedidoValue,
                        id: pedidoValue.id || pedidoValue._id,
                        numeroPedido:
                            pedidoValue.numeroPedido ||
                            pedidoValue.id?.slice?.(-6) ||
                            pedidoValue._id?.slice?.(-6),
                    }
                    : null;
        const items = Array.isArray(detail.items) ? detail.items : [];

        return items.map((item, index) => ({
            ...item,
            _id: `${detailId || "detail"}-${index}`,
            detailOrderId: detailId,
            pedido,
            cantidad: item.cantidad || 0,
            precioUnitario: item.precio || item.precioUnitario || 0,
            subtotal:
                item.subtotal ||
                (item.cantidad || 0) * (item.precio || item.precioUnitario || 0),
            plato:
                typeof item.plato === "string"
                    ? { id: item.plato, nombre: item.plato }
                    : item.plato,
            nombrePlato:
                item.nombrePlato ||
                item.plato?.nombre ||
                item.plato?.nombrePlato ||
                "N/A",
        }));
    });
};

export const useDetailOrderStore = create((set, get) => ({
    detailOrders: [],
    loading: false,
    error: null,

    fetchDetailOrders: async () => {
        try {
            set({ loading: true, error: null });
            const { data } = await getDetailOrders();
            const detailOrders = normalizeDetailOrders(data?.data || data?.detallePedidos || data || []);
            set({ detailOrders, loading: false });
            return detailOrders;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar detalles de pedidos";
            set({ error: message, loading: false });
            throw err;
        }
    },

    fetchDetailOrdersByOrderId: async (orderId) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getDetailOrdersByOrderId(orderId);
            const detailOrders = normalizeDetailOrders(data?.data || data?.detallePedidos || data || []);
            set({ detailOrders, loading: false });
            return detailOrders;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar detalles del pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    createDetailOrder: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createDetailOrder(payload);
            const newDetailOrder = normalizeDetailOrders(data?.data || data);
            set({
                detailOrders: [...newDetailOrder, ...get().detailOrders],
                loading: false,
            });
            return newDetailOrder;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear detalle de pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    updateDetailOrder: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateDetailOrder(id, payload);
            const updatedDetailOrder = normalizeDetailOrders(data?.data || data);
            set({
                detailOrders: [
                    ...get().detailOrders.filter((d) => d.detailOrderId !== id && d._id !== id && d.id !== id),
                    ...updatedDetailOrder,
                ],
                loading: false,
            });
            return updatedDetailOrder;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar detalle de pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    deleteDetailOrder: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDetailOrder(id);
            set({
                detailOrders: get().detailOrders.filter(
                    (d) => d.detailOrderId !== id && d._id !== id && d.id !== id
                ),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar detalle de pedido";
            set({ error: message, loading: false });
            throw err;
        }
    },

    getDetailOrderById: (id) => {
        return get().detailOrders.find(
            (d) => d.detailOrderId === id || d._id === id || d.id === id
        );
    },

    getDetailOrdersByOrderIdLocal: (orderId) => {
        return get().detailOrders.filter(
            (d) => d.pedido === orderId || d.pedido?._id === orderId || d.pedido?.id === orderId
        );
    },
}));
