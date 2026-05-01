import { create } from "zustand";
import {
    getTables,
    getTableById,
    getTablesByRestaurant,
    createTable,
    updateTable,
    deleteTable,
} from "../../../shared/api/table";

const getTableList = (data) => data?.data || data?.mesas || data || [];
const getTableItem = (data) => data?.data || data?.mesa || data;

export const useTableStore = create((set, get) => ({
    tables: [],
    restaurantTables: [],
    currentTable: null,
    loading: false,
    error: null,

    // Fetch all tables
    fetchTables: async (params = {}) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getTables(params);
            const tables = getTableList(data);
            set({ tables, loading: false });
            return tables;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar mesas";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Fetch restaurant tables
    fetchRestaurantTables: async (restaurantId, params = {}) => {
        if (!restaurantId) {
            set({ restaurantTables: [], loading: false, error: null });
            return [];
        }

        try {
            set({ restaurantTables: [], loading: true, error: null });
            const { data } = await getTablesByRestaurant(restaurantId, params);
            const tables = getTableList(data);
            const restaurantTables = tables.filter((table) => {
                const restaurant = table.restaurante?._id || table.restaurante || table.restaurant;
                return restaurant?.toString() === restaurantId?.toString();
            });
            set({ restaurantTables, loading: false });
            return restaurantTables;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar mesas del restaurante";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Get single table
    fetchTableById: async (id) => {
        try {
            set({ loading: true, error: null });
            const { data } = await getTableById(id);
            const currentTable = getTableItem(data);
            set({ currentTable, loading: false });
            return currentTable;
        } catch (err) {
            const message = err.response?.data?.message || "Error al cargar la mesa";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Create table
    createTable: async (payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await createTable(payload);
            const newTable = getTableItem(data);
            set({
                tables: [newTable, ...get().tables],
                restaurantTables: [newTable, ...get().restaurantTables],
                loading: false,
            });
            return newTable;
        } catch (err) {
            const message = err.response?.data?.message || "Error al crear la mesa";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Update table
    updateTable: async (id, payload) => {
        try {
            set({ loading: true, error: null });
            const { data } = await updateTable(id, payload);
            const updatedTable = getTableItem(data);
            set({
                tables: get().tables.map((t) =>
                    t._id === id || t.id === id ? updatedTable : t
                ),
                restaurantTables: get().restaurantTables.map((t) =>
                    t._id === id || t.id === id ? updatedTable : t
                ),
                currentTable: get().currentTable?.id === id ? updatedTable : get().currentTable,
                loading: false,
            });
            return updatedTable;
        } catch (err) {
            const message = err.response?.data?.message || "Error al actualizar la mesa";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Delete table
    deleteTable: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteTable(id);
            set({
                tables: get().tables.filter((t) => t._id !== id && t.id !== id),
                restaurantTables: get().restaurantTables.filter((t) => t._id !== id && t.id !== id),
                loading: false,
            });
        } catch (err) {
            const message = err.response?.data?.message || "Error al eliminar la mesa";
            set({ error: message, loading: false });
            throw err;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Clear restaurant tables
    clearRestaurantTables: () => set({ restaurantTables: [] }),

    // Clear current table
    clearCurrentTable: () => set({ currentTable: null }),
}));
