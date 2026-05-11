
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,

            // Agregar item al carrito
            addItem: (product, restId) => {
                const { items, restaurantId: currentRestaurantId } = get();
                
                // Si no viene restId, tratar de obtenerlo del producto o del estado actual
                const finalRestId = restId || product.restaurantId || currentRestaurantId;

                // Si el producto es de un restaurante diferente, limpiar el carrito anterior
                if (currentRestaurantId && finalRestId && currentRestaurantId !== finalRestId) {
                    set({
                        items: [{ ...product, restaurantId: finalRestId, quantity: 1 }],
                        restaurantId: finalRestId
                    });
                    return;
                }

                const existingItem = items.find((item) => item.id === product.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        restaurantId: finalRestId
                    });
                } else {
                    set({
                        items: [...items, { ...product, restaurantId: finalRestId, quantity: 1 }],
                        restaurantId: finalRestId
                    });
                }
            },

            // Quitar o disminuir cantidad
            removeItem: (productId) => {
                const { items } = get();
                const existingItem = items.find((item) => item.id === productId);

                if (existingItem.quantity > 1) {
                    set({
                        items: items.map((item) =>
                            item.id === productId
                                ? { ...item, quantity: item.quantity - 1 }
                                : item
                        )
                    });
                } else {
                    set({
                        items: items.filter((item) => item.id !== productId)
                    });
                }

                // Si el carrito queda vacío, limpiar el restaurantId
                if (get().items.length === 0) {
                    set({ restaurantId: null });
                }
            },

            // Eliminar item completamente
            clearItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId)
                });
                if (get().items.length === 0) {
                    set({ restaurantId: null });
                }
            },

            // Limpiar todo el carrito
            clearCart: () => set({ items: [], restaurantId: null }),

            // Cálculos
            getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            getSubtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'kinaleats-cart-storage', // Nombre para localStorage
        }
    )
);
