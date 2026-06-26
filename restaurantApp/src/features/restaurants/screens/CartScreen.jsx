import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { useCartStore } from "../store/useCartStore";
import { useToast } from "../../../shared/components/Toast";

const CartScreen = ({ navigation }) => {
    const items = useCartStore((state) => state.items);
    const restaurantName = useCartStore((state) => state.restaurantName);
    const increment = useCartStore((state) => state.increment);
    const decrement = useCartStore((state) => state.decrement);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const { showToast } = useToast();

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const goToCheckout = () => {
        const routeNames = navigation.getState()?.routeNames || [];
        if (routeNames.includes("Checkout")) {
            navigation.navigate("Checkout");
        } else {
            showToast({ type: "info", title: "Casi listo", message: "El pago estara disponible muy pronto." });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Tu seleccion</Text>
                    <Text style={styles.title}>Carrito de compras</Text>
                </View>
                {items.length > 0 ? (
                    <TouchableOpacity style={styles.clearButton} onPress={clearCart} activeOpacity={0.85}>
                        <Ionicons name="trash-outline" size={18} color="#e11d48" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconButtonGhost} />
                )}
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="cart-outline" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
                    <Text style={styles.emptySubtitle}>
                        Explora los menus y agrega tus platos favoritos para empezar tu pedido.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate("RestaurantsHome")}
                        activeOpacity={0.88}
                    >
                        <Text style={styles.emptyButtonText}>EXPLORAR RESTAURANTES</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        {restaurantName ? (
                            <View style={styles.restaurantBanner}>
                                <Ionicons name="storefront-outline" size={16} color={COLORS.accent} />
                                <Text style={styles.restaurantBannerText} numberOfLines={1}>{restaurantName}</Text>
                            </View>
                        ) : null}

                        {items.map((item) => (
                            <View key={item.id} style={styles.itemCard}>
                                {item.image ? (
                                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                                ) : (
                                    <View style={styles.itemImageFallback}>
                                        <Ionicons name="fast-food-outline" size={24} color={COLORS.primary} />
                                    </View>
                                )}

                                <View style={styles.itemBody}>
                                    <View style={styles.itemTopLine}>
                                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => removeItem(item.id)} activeOpacity={0.7} hitSlop={8}>
                                            <Ionicons name="close" size={18} color={COLORS.textLight} />
                                        </TouchableOpacity>
                                    </View>

                                    {item.notas ? <Text style={styles.itemNotes} numberOfLines={1}>Nota: {item.notas}</Text> : null}

                                    <View style={styles.itemBottomLine}>
                                        <View style={styles.stepper}>
                                            <TouchableOpacity
                                                style={styles.stepButton}
                                                onPress={() => decrement(item.id)}
                                                activeOpacity={0.85}
                                            >
                                                <Ionicons
                                                    name={item.quantity > 1 ? "remove" : "trash-outline"}
                                                    size={16}
                                                    color={item.quantity > 1 ? COLORS.text : "#e11d48"}
                                                />
                                            </TouchableOpacity>
                                            <Text style={styles.stepValue}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.stepButton}
                                                onPress={() => increment(item.id)}
                                                activeOpacity={0.85}
                                            >
                                                <Ionicons name="add" size={16} color={COLORS.text} />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.itemPrice}>Q{(item.price * item.quantity).toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerLabel}>Subtotal ({totalItems} items)</Text>
                            <Text style={styles.footerValue}>Q{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.footerRow}>
                            <Text style={styles.footerLabel}>Envio</Text>
                            <Text style={styles.footerFree}>GRATIS</Text>
                        </View>
                        <View style={styles.footerDivider} />
                        <View style={styles.footerRow}>
                            <Text style={styles.footerTotalLabel}>Total a pagar</Text>
                            <Text style={styles.footerTotalValue}>Q{subtotal.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={goToCheckout}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.checkoutButtonText}>PROCEDER AL PAGO</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconButtonGhost: {
        width: 42,
        height: 42,
    },
    clearButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#fff1f2",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#fecdd3",
    },
    headerCopy: {
        flex: 1,
    },
    kicker: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
        marginTop: 2,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 24,
        gap: 12,
    },
    restaurantBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: COLORS.accentSoft,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    restaurantBannerText: {
        flex: 1,
        color: COLORS.accent,
        fontSize: 13,
        fontWeight: "900",
    },
    itemCard: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    itemImage: {
        width: 78,
        height: 78,
        borderRadius: 14,
        backgroundColor: COLORS.accentSoft,
    },
    itemImageFallback: {
        width: 78,
        height: 78,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.accentSoft,
    },
    itemBody: {
        flex: 1,
        justifyContent: "space-between",
        gap: 8,
    },
    itemTopLine: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
    },
    itemName: {
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "900",
        lineHeight: 19,
    },
    itemNotes: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        fontStyle: "italic",
    },
    itemBottomLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.surfaceMuted,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    stepButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    stepValue: {
        minWidth: 18,
        textAlign: "center",
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "900",
    },
    itemPrice: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "900",
    },
    footer: {
        backgroundColor: COLORS.primaryDark,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 20,
        paddingBottom: 28,
        gap: 10,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    footerLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "700",
    },
    footerValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    footerFree: {
        color: "#34d399",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 0.6,
        backgroundColor: "rgba(52, 211, 153, 0.12)",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        overflow: "hidden",
    },
    footerDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        marginVertical: 4,
    },
    footerTotalLabel: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "900",
    },
    footerTotalValue: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    checkoutButton: {
        marginTop: 10,
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    checkoutButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "900",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        textAlign: "center",
    },
    emptyButton: {
        marginTop: 10,
        minHeight: 50,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1.1,
    },
});

export default CartScreen;
