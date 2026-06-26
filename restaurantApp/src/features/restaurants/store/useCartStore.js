import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const buildItem = ({ id, name, price, image, quantity = 1, notas = "" }) => ({
    id: String(id),
    name,
    price: Number(price) || 0,
    image: image || null,
    quantity: Math.max(1, Number(quantity) || 1),
    notas: notas || "",
});

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            restaurantName: null,

            // Agrega un plato. Si el carrito ya tiene platos de OTRO restaurante,
            // no agrega y devuelve { ok: false, reason: "different-restaurant" }
            // para que la pantalla pida confirmacion antes de vaciar.
            addItem: (payload) => {
                const { items, restaurantId } = get();
                const restId = String(payload.restaurantId);

                if (items.length > 0 && restaurantId && String(restaurantId) !== restId) {
                    return { ok: false, reason: "different-restaurant" };
                }

                const newItem = buildItem(payload);
                const existing = items.find((item) => item.id === newItem.id);

                if (existing) {
                    set({
                        items: items.map((item) =>
                            item.id === newItem.id
                                ? {
                                      ...item,
                                      quantity: item.quantity + newItem.quantity,
                                      notas: newItem.notas || item.notas,
                                  }
                                : item
                        ),
                    });
                } else {
                    set({
                        items: [...items, newItem],
                        restaurantId: restId,
                        restaurantName: payload.restaurantName || get().restaurantName,
                    });
                }

                return { ok: true };
            },

            // Vacia el carrito anterior y empieza uno nuevo con este plato.
            startNewCart: (payload) => {
                set({
                    items: [buildItem(payload)],
                    restaurantId: String(payload.restaurantId),
                    restaurantName: payload.restaurantName || null,
                });
            },

            increment: (id) => {
                set({
                    items: get().items.map((item) =>
                        item.id === String(id) ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                });
            },

            decrement: (id) => {
                const items = get().items
                    .map((item) =>
                        item.id === String(id) ? { ...item, quantity: item.quantity - 1 } : item
                    )
                    .filter((item) => item.quantity > 0);

                set(items.length === 0 ? { items: [], restaurantId: null, restaurantName: null } : { items });
            },

            removeItem: (id) => {
                const items = get().items.filter((item) => item.id !== String(id));
                set(items.length === 0 ? { items: [], restaurantId: null, restaurantName: null } : { items });
            },

            clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

            getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            getSubtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
