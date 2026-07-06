import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../../../shared/store/authStore";
import { useToast } from "../../../shared/components/Toast";
import { createOrder } from "../../../shared/api/orders";

const PAYMENT_METHODS = [
    { value: "Efectivo", label: "Efectivo", icon: "cash-outline" },
    { value: "Tarjeta", label: "Tarjeta", icon: "card-outline" },
];

const CheckoutScreen = ({ navigation }) => {
    const items = useCartStore((state) => state.items);
    const restaurantId = useCartStore((state) => state.restaurantId);
    const restaurantName = useCartStore((state) => state.restaurantName);
    const clearCart = useCartStore((state) => state.clearCart);
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToast();

    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState(user?.phone || user?.telefono || "");
    const [paymentMethod, setPaymentMethod] = useState("Efectivo");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const hasOrdersRoute = (navigation.getState()?.routeNames || []).includes("MyOrders");

    const handleConfirm = async () => {
        const nextErrors = {};
        if (!address.trim()) nextErrors.address = "La direccion de entrega es obligatoria.";
        if (!phone.trim()) nextErrors.phone = "El telefono de contacto es obligatorio.";
        if (!paymentMethod) nextErrors.paymentMethod = "Selecciona un metodo de pago.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        if (!restaurantId || items.length === 0) {
            showToast({ type: "error", title: "Carrito vacio", message: "Agrega platos antes de pagar." });
            return;
        }

        const cliente =
            `${user?.name || user?.nombre || ""} ${user?.surname || user?.apellido || ""}`.trim() || "Cliente";

        const payload = {
            restaurante: restaurantId,
            tipoPedido: "Domicilio",
            cliente,
            email: user?.email || "",
            telefono: phone.trim(),
            direccionEntrega: address.trim(),
            notas: notes.trim(),
            metodoPago: paymentMethod,
            items: items.map((item) => ({
                plato: item.id,
                cantidad: item.quantity,
                precio: item.price,
            })),
        };

        try {
            setSubmitting(true);
            await createOrder(payload);
            clearCart();
            setSuccessVisible(true);
        } catch (err) {
            showToast({
                type: "error",
                title: "No se pudo crear el pedido",
                message: err.response?.data?.message || err.message || "Intenta de nuevo.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleFinish = () => {
        setSuccessVisible(false);
        if (hasOrdersRoute) {
            navigation.navigate("MyOrders");
        } else {
            navigation.navigate("RestaurantsHome");
        }
    };

    if (items.length === 0 && !successVisible) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCopy}>
                        <Text style={styles.kicker}>Pago</Text>
                        <Text style={styles.title}>Finalizar pedido</Text>
                    </View>
                    <View style={styles.iconButtonGhost} />
                </View>
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="cart-outline" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>No hay nada que pagar</Text>
                    <Text style={styles.emptySubtitle}>Tu carrito esta vacio. Agrega platos para continuar.</Text>
                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={() => navigation.navigate("RestaurantsHome")}
                        activeOpacity={0.88}
                    >
                        <Text style={styles.emptyButtonText}>EXPLORAR RESTAURANTES</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Pago</Text>
                    <Text style={styles.title}>Finalizar pedido</Text>
                </View>
                <View style={styles.iconButtonGhost} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Direccion */}
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <View style={[styles.sectionIcon, { backgroundColor: COLORS.accentSoft }]}>
                                <Ionicons name="location-outline" size={18} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Direccion de entrega</Text>
                                <Text style={styles.sectionHint}>A donde enviamos tu pedido</Text>
                            </View>
                        </View>
                        <TextInput
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Escribe tu direccion completa..."
                            placeholderTextColor="#94a3b8"
                            style={[styles.input, styles.textarea, errors.address && styles.inputError]}
                            multiline
                        />
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                    </View>

                    {/* Telefono */}
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <View style={[styles.sectionIcon, { backgroundColor: "#eff6ff" }]}>
                                <Ionicons name="call-outline" size={18} color="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Telefono de contacto</Text>
                                <Text style={styles.sectionHint}>Para coordinar la entrega</Text>
                            </View>
                        </View>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Ej: 5555-5555"
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                            style={[styles.input, errors.phone && styles.inputError]}
                        />
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </View>

                    {/* Metodo de pago */}
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <View style={[styles.sectionIcon, { backgroundColor: "#f0fdf4" }]}>
                                <Ionicons name="wallet-outline" size={18} color="#16a34a" />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Metodo de pago</Text>
                                <Text style={styles.sectionHint}>Como deseas pagar</Text>
                            </View>
                        </View>
                        <View style={styles.paymentRow}>
                            {PAYMENT_METHODS.map((method) => {
                                const active = paymentMethod === method.value;
                                return (
                                    <TouchableOpacity
                                        key={method.value}
                                        style={[styles.paymentCard, active && styles.paymentCardActive]}
                                        onPress={() => setPaymentMethod(method.value)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons
                                            name={method.icon}
                                            size={22}
                                            color={active ? COLORS.primaryDark : COLORS.textLight}
                                        />
                                        <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>
                                            {method.label}
                                        </Text>
                                        {active ? (
                                            <View style={styles.paymentCheck}>
                                                <Ionicons name="checkmark" size={12} color="#fff" />
                                            </View>
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.paymentMethod ? <Text style={styles.errorText}>{errors.paymentMethod}</Text> : null}
                    </View>

                    {/* Notas */}
                    <View style={styles.section}>
                        <View style={styles.sectionHead}>
                            <View style={[styles.sectionIcon, { backgroundColor: COLORS.surfaceMuted }]}>
                                <Ionicons name="document-text-outline" size={18} color={COLORS.textLight} />
                            </View>
                            <View>
                                <Text style={styles.sectionTitle}>Notas (opcional)</Text>
                                <Text style={styles.sectionHint}>Instrucciones para el repartidor</Text>
                            </View>
                        </View>
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Ej: Tocar el timbre, casa de porton azul..."
                            placeholderTextColor="#94a3b8"
                            style={[styles.input, styles.textarea]}
                            multiline
                        />
                    </View>

                    {/* Resumen */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Tu pedido</Text>
                            <Text style={styles.summaryBadge}>{totalItems} items</Text>
                        </View>
                        {restaurantName ? <Text style={styles.summaryRestaurant}>{restaurantName}</Text> : null}

                        <View style={styles.summaryItems}>
                            {items.map((item) => (
                                <View key={item.id} style={styles.summaryItem}>
                                    {item.image ? (
                                        <Image source={{ uri: item.image }} style={styles.summaryImage} />
                                    ) : (
                                        <View style={styles.summaryImageFallback}>
                                            <Ionicons name="fast-food-outline" size={18} color={COLORS.primary} />
                                        </View>
                                    )}
                                    <View style={styles.summaryItemBody}>
                                        <Text style={styles.summaryItemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.summaryItemQty}>x{item.quantity}</Text>
                                    </View>
                                    <Text style={styles.summaryItemPrice}>Q{(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>Q{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Envio</Text>
                            <Text style={styles.summaryFree}>GRATIS</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomBar}>
                    <View style={styles.bottomTotal}>
                        <Text style={styles.bottomTotalLabel}>Total</Text>
                        <Text style={styles.bottomTotalValue}>Q{subtotal.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
                        onPress={handleConfirm}
                        activeOpacity={0.9}
                        disabled={submitting}
                    >
                        <Text style={styles.confirmButtonText}>{submitting ? "PROCESANDO..." : "CONFIRMAR PEDIDO"}</Text>
                        {!submitting ? <Ionicons name="checkmark-circle" size={18} color="#fff" /> : null}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <Modal visible={successVisible} transparent animationType="fade" onRequestClose={handleFinish}>
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={36} color="#fff" />
                        </View>
                        <Text style={styles.successTitle}>Pedido confirmado</Text>
                        <Text style={styles.successMessage}>
                            Tu pedido fue enviado al restaurante. Podras seguir su estado en tus pedidos.
                        </Text>
                        <TouchableOpacity style={styles.successPrimary} onPress={handleFinish} activeOpacity={0.9}>
                            <Text style={styles.successPrimaryText}>
                                {hasOrdersRoute ? "VER MIS PEDIDOS" : "VOLVER AL INICIO"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
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
        gap: 16,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 12,
    },
    sectionHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sectionIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "900",
    },
    sectionHint: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 1,
    },
    input: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },
    textarea: {
        minHeight: 84,
        textAlignVertical: "top",
    },
    inputError: {
        borderColor: "#fda4af",
        backgroundColor: "#fff1f2",
    },
    errorText: {
        color: "#e11d48",
        fontSize: 12,
        fontWeight: "800",
    },
    paymentRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    paymentCard: {
        flex: 1,
        minWidth: 132,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingVertical: 18,
        alignItems: "center",
        gap: 8,
    },
    paymentCardActive: {
        borderColor: COLORS.primaryDark,
        backgroundColor: "#fff",
    },
    paymentLabel: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "800",
    },
    paymentLabelActive: {
        color: COLORS.primaryDark,
    },
    paymentCheck: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
    },
    summaryCard: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: 24,
        padding: 20,
        gap: 12,
    },
    summaryHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "900",
    },
    summaryBadge: {
        color: COLORS.primary,
        backgroundColor: "rgba(245, 158, 11, 0.14)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        overflow: "hidden",
    },
    summaryRestaurant: {
        color: "rgba(255,255,255,0.66)",
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: -4,
    },
    summaryItems: {
        gap: 12,
    },
    summaryItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    summaryImage: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    summaryImageFallback: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    summaryItemBody: {
        flex: 1,
    },
    summaryItemName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    summaryItemQty: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginTop: 2,
    },
    summaryItemPrice: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "900",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        marginVertical: 2,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "700",
    },
    summaryValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "800",
    },
    summaryFree: {
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
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 14,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 28 : 16,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    bottomTotal: {
        minWidth: 92,
        justifyContent: "center",
    },
    bottomTotalLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    bottomTotalValue: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
    },
    confirmButton: {
        flex: 1,
        minWidth: 190,
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    confirmButtonDisabled: {
        opacity: 0.7,
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.8,
        textAlign: "center",
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
    successOverlay: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.78)",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
    },
    successCard: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#fff",
        borderRadius: 28,
        padding: 26,
        alignItems: "center",
        gap: 12,
    },
    successIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.success,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    successTitle: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
        textAlign: "center",
    },
    successMessage: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        textAlign: "center",
    },
    successPrimary: {
        marginTop: 8,
        width: "100%",
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
    },
    successPrimaryText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1,
    },
});

export default CheckoutScreen;
