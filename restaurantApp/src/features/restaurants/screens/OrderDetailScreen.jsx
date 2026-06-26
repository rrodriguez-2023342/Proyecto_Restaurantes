import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
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
import { useToast } from "../../../shared/components/Toast";
import { getOrderById, getOrderDetailByOrderId, updateOrder, cancelOrder } from "../../../shared/api/orders";
import {
    TRACKING_STEPS,
    getTrackingStep,
    getStatusConfig,
    isCancelledStatus,
    isDeliveredStatus,
    isPendingStatus,
} from "../../../shared/utils/orderStatus";
import DeliveryTruck from "../components/DeliveryTruck";

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-GT", {
        timeZone: "America/Guatemala",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const extractItems = (payload) => {
    const details = Array.isArray(payload) ? payload : payload ? [payload] : [];
    return details.flatMap((detail) => {
        const items = Array.isArray(detail.items) ? detail.items : [];
        return items.map((item, index) => {
            const cantidad = Number(item.cantidad || 0);
            const precio = Number(item.precio || item.precioUnitario || 0);
            return {
                key: `${detail.detallePedidoId || detail._id || "d"}-${index}`,
                nombre:
                    item.plato?.nombrePlato ||
                    item.plato?.nombre ||
                    item.nombrePlato ||
                    "Plato",
                cantidad,
                precio,
                subtotal: cantidad * precio,
            };
        });
    });
};

const OrderDetailScreen = ({ navigation, route }) => {
    const orderId = route.params?.orderId || route.params?.order?._id || route.params?.order?.id;
    const { showToast } = useToast();

    const [order, setOrder] = useState(route.params?.order || null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [cancelVisible, setCancelVisible] = useState(false);

    const loadOrder = useCallback(async () => {
        if (!orderId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [orderRes, detailRes] = await Promise.all([
                getOrderById(orderId),
                getOrderDetailByOrderId(orderId).catch(() => null),
            ]);

            const freshOrder =
                orderRes?.data?.data || orderRes?.data?.pedido || orderRes?.data || route.params?.order || null;
            setOrder(freshOrder);
            setAddress(freshOrder?.direccionEntrega || "");
            setPhone(freshOrder?.telefono || "");
            setNotes(freshOrder?.notas || "");

            const detailPayload = detailRes?.data?.data || detailRes?.data?.detallePedidos || detailRes?.data || null;
            setItems(extractItems(detailPayload));
        } catch (err) {
            showToast({
                type: "error",
                title: "Error",
                message: err.response?.data?.message || "No se pudo cargar el pedido.",
            });
        } finally {
            setLoading(false);
        }
    }, [orderId, route.params?.order, showToast]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    const status = order?.estadoPedido;
    const step = getTrackingStep(status);
    const cancelled = isCancelledStatus(status);
    const delivered = isDeliveredStatus(status);
    const pending = isPendingStatus(status);
    const canUpdate = !cancelled && !delivered;
    const statusConfig = getStatusConfig(status);
    const code = String(order?._id || order?.id || orderId || "").slice(-6);
    const total = Number(order?.totalPedido || order?.total || 0);

    const trackingSteps = useMemo(
        () =>
            TRACKING_STEPS.map((stepItem, index) => ({
                ...stepItem,
                state: index < step ? "completed" : index === step ? "active" : "upcoming",
            })),
        [step]
    );

    const handleSaveDelivery = async () => {
        if (!address.trim()) {
            showToast({ type: "error", title: "Falta la direccion", message: "Ingresa una direccion de entrega." });
            return;
        }
        try {
            setSaving(true);
            await updateOrder(orderId, {
                direccionEntrega: address.trim(),
                telefono: phone.trim(),
                notas: notes.trim(),
            });
            setOrder((prev) => ({ ...prev, direccionEntrega: address.trim(), telefono: phone.trim(), notas: notes.trim() }));
            showToast({ type: "success", title: "Listo", message: "Datos de entrega actualizados." });
        } catch (err) {
            showToast({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo actualizar." });
        } finally {
            setSaving(false);
        }
    };

    const handleMarkDelivered = async () => {
        try {
            setConfirming(true);
            await updateOrder(orderId, { estadoPedido: "Entregado" });
            setOrder((prev) => ({ ...prev, estadoPedido: "Entregado" }));
            showToast({ type: "success", title: "Entregado", message: "Pedido marcado como entregado." });
        } catch (err) {
            showToast({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo confirmar." });
        } finally {
            setConfirming(false);
        }
    };

    const handleCancel = async () => {
        setCancelVisible(false);
        try {
            setConfirming(true);
            await cancelOrder(orderId);
            setOrder((prev) => ({ ...prev, estadoPedido: "Cancelado" }));
            showToast({ type: "success", title: "Cancelado", message: "Tu pedido fue cancelado." });
        } catch (err) {
            showToast({ type: "error", title: "Error", message: err.response?.data?.message || "No se pudo cancelar." });
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeAreaLight}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando pedido...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={styles.heroTopRow}>
                            <TouchableOpacity style={styles.heroBack} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                                <Ionicons name="chevron-back" size={22} color="#fff" />
                            </TouchableOpacity>
                            <View style={[styles.heroStatus, { backgroundColor: statusConfig.bg }]}>
                                <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                                <Text style={[styles.heroStatusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                            </View>
                        </View>
                        <Text style={styles.heroRestaurant}>{order?.restaurante?.nombre || order?.restaurante?.name || "Restaurante"}</Text>
                        <Text style={styles.heroTitle}>Pedido <Text style={styles.heroAccent}>#{code}</Text></Text>
                        <Text style={styles.heroDate}>{formatDate(order?.createdAt || order?.fechaPedido)}</Text>
                    </View>

                    <View style={styles.body}>
                        {/* Tracking */}
                        <View style={styles.card}>
                            {cancelled ? (
                                <View style={styles.cancelBanner}>
                                    <Ionicons name="close-circle" size={22} color="#e11d48" />
                                    <Text style={styles.cancelBannerText}>Este pedido fue cancelado.</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.cardHead}>
                                        <View style={[styles.cardHeadIcon, { backgroundColor: COLORS.accentSoft }]}>
                                            <Ionicons name="bicycle-outline" size={20} color={COLORS.accent} />
                                        </View>
                                        <View>
                                            <Text style={styles.cardTitle}>Estado del envio</Text>
                                            <Text style={styles.cardHint}>Sigue tu pedido en tiempo real</Text>
                                        </View>
                                    </View>

                                    {!delivered ? (
                                        <View style={styles.truckBox}>
                                            <DeliveryTruck progress={(step / 3) * 100} />
                                        </View>
                                    ) : null}

                                    <View style={styles.timeline}>
                                        {trackingSteps.map((stepItem, index) => {
                                            const completed = stepItem.state === "completed";
                                            const active = stepItem.state === "active";
                                            const isLast = index === trackingSteps.length - 1;
                                            return (
                                                <View key={stepItem.key} style={styles.timelineRow}>
                                                    <View style={styles.timelineLeft}>
                                                        <View
                                                            style={[
                                                                styles.timelineDot,
                                                                completed && styles.timelineDotCompleted,
                                                                active && styles.timelineDotActive,
                                                            ]}
                                                        >
                                                            <Ionicons
                                                                name={completed ? "checkmark" : stepItem.icon}
                                                                size={16}
                                                                color={completed || active ? "#fff" : "#94a3b8"}
                                                            />
                                                        </View>
                                                        {!isLast ? (
                                                            <View style={[styles.timelineLine, completed && styles.timelineLineActive]} />
                                                        ) : null}
                                                    </View>
                                                    <View style={styles.timelineCopy}>
                                                        <View style={styles.timelineTitleRow}>
                                                            <Text
                                                                style={[
                                                                    styles.timelineTitle,
                                                                    active && { color: COLORS.accent },
                                                                    !completed && !active && { color: COLORS.textLight },
                                                                ]}
                                                            >
                                                                {stepItem.title}
                                                            </Text>
                                                            {active ? (
                                                                <View style={styles.timelineBadge}>
                                                                    <Text style={styles.timelineBadgeText}>Actual</Text>
                                                                </View>
                                                            ) : null}
                                                        </View>
                                                        <Text style={styles.timelineDesc}>{stepItem.description}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Items */}
                        <View style={styles.card}>
                            <View style={styles.cardHead}>
                                <View style={[styles.cardHeadIcon, { backgroundColor: COLORS.surfaceMuted }]}>
                                    <Ionicons name="receipt-outline" size={20} color={COLORS.textLight} />
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>Articulos</Text>
                                    <Text style={styles.cardHint}>{items.length} items en tu pedido</Text>
                                </View>
                            </View>

                            {items.length > 0 ? (
                                items.map((item) => (
                                    <View key={item.key} style={styles.itemRow}>
                                        <View style={styles.itemQty}>
                                            <Text style={styles.itemQtyText}>x{item.cantidad}</Text>
                                        </View>
                                        <View style={styles.itemBody}>
                                            <Text style={styles.itemName} numberOfLines={2}>{item.nombre}</Text>
                                            <Text style={styles.itemUnit}>Q{item.precio.toFixed(2)} c/u</Text>
                                        </View>
                                        <Text style={styles.itemSubtotal}>Q{item.subtotal.toFixed(2)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noItems}>No se pudieron cargar los articulos de este pedido.</Text>
                            )}
                        </View>

                        {/* Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Resumen</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>Q{total.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Envio</Text>
                                <Text style={styles.summaryFree}>GRATIS</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <Text style={styles.summaryTotalLabel}>Total</Text>
                            <Text style={styles.summaryTotalValue}>Q{total.toFixed(2)}</Text>
                        </View>

                        {/* Delivery info */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Datos de entrega</Text>

                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>Direccion</Text>
                                <TextInput
                                    value={address}
                                    onChangeText={setAddress}
                                    editable={canUpdate}
                                    placeholder="Tu direccion"
                                    placeholderTextColor="#94a3b8"
                                    style={[styles.input, styles.textarea, !canUpdate && styles.inputDisabled]}
                                    multiline
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>Telefono</Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    editable={canUpdate}
                                    keyboardType="phone-pad"
                                    placeholder="Ej: 5555-5555"
                                    placeholderTextColor="#94a3b8"
                                    style={[styles.input, !canUpdate && styles.inputDisabled]}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.fieldLabel}>Notas</Text>
                                <TextInput
                                    value={notes}
                                    onChangeText={setNotes}
                                    editable={canUpdate}
                                    placeholder="Instrucciones para el repartidor"
                                    placeholderTextColor="#94a3b8"
                                    style={[styles.input, styles.textarea, !canUpdate && styles.inputDisabled]}
                                    multiline
                                />
                            </View>

                            {canUpdate ? (
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveDelivery} activeOpacity={0.9} disabled={saving}>
                                    <Ionicons name="save-outline" size={17} color="#fff" />
                                    <Text style={styles.saveButtonText}>{saving ? "Guardando..." : "Actualizar datos"}</Text>
                                </TouchableOpacity>
                            ) : null}

                            {canUpdate && !pending ? (
                                <TouchableOpacity style={styles.deliveredButton} onPress={handleMarkDelivered} activeOpacity={0.9} disabled={confirming}>
                                    <Ionicons name="shield-checkmark-outline" size={17} color="#fff" />
                                    <Text style={styles.deliveredButtonText}>{confirming ? "Confirmando..." : "Marcar entregado"}</Text>
                                </TouchableOpacity>
                            ) : null}

                            {pending ? (
                                <TouchableOpacity style={styles.cancelOrderButton} onPress={() => setCancelVisible(true)} activeOpacity={0.9} disabled={confirming}>
                                    <Ionicons name="close-circle-outline" size={17} color="#e11d48" />
                                    <Text style={styles.cancelOrderButtonText}>Cancelar pedido</Text>
                                </TouchableOpacity>
                            ) : null}

                            {delivered ? (
                                <View style={styles.deliveredBanner}>
                                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                                    <Text style={styles.deliveredBannerText}>Pedido entregado</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={cancelVisible} transparent animationType="fade" onRequestClose={() => setCancelVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIcon}>
                            <Ionicons name="alert-circle-outline" size={26} color="#e11d48" />
                        </View>
                        <Text style={styles.modalTitle}>Cancelar pedido</Text>
                        <Text style={styles.modalMessage}>Esta accion no se puede deshacer. Solo es posible mientras el pedido esta pendiente.</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setCancelVisible(false)} activeOpacity={0.85}>
                                <Text style={styles.modalCancelText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleCancel} activeOpacity={0.85}>
                                <Text style={styles.modalConfirmText}>Si, cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.primaryDark,
    },
    safeAreaLight: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 36,
    },
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    stateText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "700",
    },
    hero: {
        backgroundColor: COLORS.primaryDark,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 34,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        gap: 4,
    },
    heroTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    heroBack: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    heroStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    heroStatusText: {
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    heroRestaurant: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.4,
    },
    heroTitle: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    heroAccent: {
        color: COLORS.primary,
    },
    heroDate: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: "600",
        marginTop: 2,
    },
    body: {
        padding: 16,
        gap: 16,
        marginTop: -16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 18,
        gap: 14,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 2,
    },
    cardHead: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cardHeadIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "900",
    },
    cardHint: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 1,
    },
    truckBox: {
        backgroundColor: COLORS.surfaceMuted,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    timeline: {
        gap: 0,
    },
    timelineRow: {
        flexDirection: "row",
        gap: 14,
    },
    timelineLeft: {
        alignItems: "center",
        width: 40,
    },
    timelineDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    timelineDotCompleted: {
        backgroundColor: "#16a34a",
        borderColor: "#16a34a",
    },
    timelineDotActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        minHeight: 22,
        backgroundColor: COLORS.border,
        marginVertical: 2,
    },
    timelineLineActive: {
        backgroundColor: "#16a34a",
    },
    timelineCopy: {
        flex: 1,
        paddingBottom: 18,
        gap: 2,
    },
    timelineTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timelineTitle: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "900",
    },
    timelineBadge: {
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    timelineBadgeText: {
        color: COLORS.accent,
        fontSize: 9,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    timelineDesc: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.surfaceMuted,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    itemQty: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    itemQtyText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
    },
    itemBody: {
        flex: 1,
    },
    itemName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "800",
    },
    itemUnit: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    itemSubtotal: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "900",
    },
    noItems: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        paddingVertical: 8,
    },
    summaryCard: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: 24,
        padding: 22,
        gap: 12,
    },
    summaryTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "900",
        marginBottom: 4,
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
    summaryDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        marginVertical: 4,
    },
    summaryTotalLabel: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    summaryTotalValue: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: -0.5,
    },
    field: {
        gap: 8,
    },
    fieldLabel: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
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
        minHeight: 60,
        textAlignVertical: "top",
    },
    inputDisabled: {
        opacity: 0.6,
    },
    saveButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: COLORS.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    deliveredButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: COLORS.success,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    deliveredButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    cancelOrderButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: "#fff1f2",
        borderWidth: 1.5,
        borderColor: "#fda4af",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    cancelOrderButtonText: {
        color: "#e11d48",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    deliveredBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#f0fdf4",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#bbf7d0",
        paddingVertical: 12,
    },
    deliveredBannerText: {
        color: "#16a34a",
        fontSize: 13,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    cancelBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fff1f2",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#fecdd3",
        padding: 16,
    },
    cancelBannerText: {
        color: "#e11d48",
        fontSize: 14,
        fontWeight: "800",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.6)",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
    },
    modalContent: {
        width: "100%",
        maxWidth: 380,
        borderRadius: 24,
        backgroundColor: "#fff",
        padding: 24,
        alignItems: "center",
        gap: 10,
    },
    modalIcon: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#fff1f2",
        alignItems: "center",
        justifyContent: "center",
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
        textAlign: "center",
    },
    modalMessage: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        textAlign: "center",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
        width: "100%",
    },
    modalCancelButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "800",
    },
    modalConfirmButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: "#e11d48",
        alignItems: "center",
        justifyContent: "center",
    },
    modalConfirmText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
    },
});

export default OrderDetailScreen;
