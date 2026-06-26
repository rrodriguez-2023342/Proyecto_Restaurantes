import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { getOrders, cancelOrder } from "../../../shared/api/orders";
import {
    ORDER_FILTERS,
    getStatusConfig,
    isPendingStatus,
    matchesFilter,
} from "../../../shared/utils/orderStatus";

const getList = (data, key) => data?.data || data?.[key] || data || [];

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-GT", {
        timeZone: "America/Guatemala",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const MyOrdersScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [savingId, setSavingId] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const loadOrders = useCallback(async ({ refresh = false } = {}) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const { data } = await getOrders({ limit: 100 });
            setOrders(getList(data, "pedidos"));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar tus pedidos.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders().catch(() => null);
        const unsubscribe = navigation.addListener("focus", () => {
            loadOrders({ refresh: true }).catch(() => null);
        });
        return unsubscribe;
    }, [navigation, loadOrders]);

    const visibleOrders = useMemo(() => {
        return [...orders]
            .filter((order) => matchesFilter(order.estadoPedido, filter))
            .sort((a, b) => new Date(b.createdAt || b.fechaPedido || 0) - new Date(a.createdAt || a.fechaPedido || 0));
    }, [orders, filter]);

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        const id = cancelTarget._id || cancelTarget.id;
        setSavingId(id);
        setCancelTarget(null);

        try {
            await cancelOrder(id);
            setOrders((prev) =>
                prev.map((order) => ((order._id || order.id) === id ? { ...order, estadoPedido: "Cancelado" } : order))
            );
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cancelar el pedido.");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Historial</Text>
                    <Text style={styles.title}>Mis pedidos</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={() => loadOrders({ refresh: true })} activeOpacity={0.85}>
                    <Ionicons name="refresh" size={19} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterRow}
            >
                {ORDER_FILTERS.map((item) => {
                    const active = filter === item.key;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.filterChip, active && styles.filterChipActive]}
                            onPress={() => setFilter(item.key)}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando pedidos...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders({ refresh: true })} tintColor={COLORS.primary} />
                    }
                >
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {visibleOrders.length > 0 ? (
                        visibleOrders.map((order) => {
                            const id = String(order._id || order.id);
                            return (
                                <OrderCard
                                    key={id}
                                    order={order}
                                    saving={savingId === id}
                                    onTrack={() => navigation.navigate("OrderDetail", { orderId: id, order })}
                                    onCancel={() => setCancelTarget(order)}
                                />
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={34} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>
                                {filter === "all" ? "Aun no tienes pedidos" : "Sin pedidos en este filtro"}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {filter === "all"
                                    ? "Cuando hagas un pedido, aparecera aqui con su seguimiento en tiempo real."
                                    : "Prueba con otro filtro para ver mas pedidos."}
                            </Text>
                            {filter === "all" ? (
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={() => navigation.navigate("RestaurantsHome")}
                                    activeOpacity={0.88}
                                >
                                    <Text style={styles.emptyButtonText}>EXPLORAR RESTAURANTES</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    )}
                </ScrollView>
            )}

            <Modal visible={cancelTarget !== null} transparent animationType="fade" onRequestClose={() => setCancelTarget(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIcon}>
                            <Ionicons name="alert-circle-outline" size={26} color="#e11d48" />
                        </View>
                        <Text style={styles.modalTitle}>Cancelar pedido</Text>
                        <Text style={styles.modalMessage}>
                            Solo puedes cancelar mientras el pedido esta pendiente. Esta accion no se puede deshacer.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setCancelTarget(null)} activeOpacity={0.85}>
                                <Text style={styles.modalCancelText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmCancel} activeOpacity={0.85}>
                                <Text style={styles.modalConfirmText}>Si, cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const OrderCard = ({ order, onTrack, onCancel, saving }) => {
    const status = getStatusConfig(order.estadoPedido);
    const restaurantName = order.restaurante?.nombre || order.restaurante?.name || "Restaurante";
    const code = String(order._id || order.id || "").slice(-6);
    const total = Number(order.totalPedido || order.total || 0);
    const canCancel = isPendingStatus(order.estadoPedido);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Ionicons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
                <Text style={styles.cardCode}>#{code}</Text>
            </View>

            <Text style={styles.restaurantName} numberOfLines={2}>{restaurantName}</Text>
            <Text style={styles.cardDate}>{formatDate(order.createdAt || order.fechaPedido)}</Text>

            {order.direccionEntrega ? (
                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={15} color={COLORS.textLight} />
                    <Text style={styles.addressText} numberOfLines={1}>{order.direccionEntrega}</Text>
                </View>
            ) : null}

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>Q{total.toFixed(2)}</Text>
                </View>
                <View style={styles.cardActions}>
                    {canCancel ? (
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.88} disabled={saving}>
                            <Ionicons name="close-outline" size={16} color="#e11d48" />
                            <Text style={styles.cancelButtonText}>{saving ? "..." : "Cancelar"}</Text>
                        </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.trackButton} onPress={onTrack} activeOpacity={0.9}>
                        <Ionicons name="navigate-outline" size={16} color="#fff" />
                        <Text style={styles.trackButtonText}>Seguimiento</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    refreshButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
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
    filterScroll: {
        maxHeight: 52,
        flexGrow: 0,
    },
    filterRow: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
    },
    filterChip: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        height: 38,
        justifyContent: "center",
    },
    filterChipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    filterChipText: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    filterChipTextActive: {
        color: "#fff",
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
    content: {
        padding: 16,
        paddingBottom: 34,
        gap: 14,
    },
    errorText: {
        color: "#991b1b",
        backgroundColor: "#fff1f2",
        borderRadius: 14,
        padding: 12,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    cardCode: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "800",
    },
    restaurantName: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
        lineHeight: 23,
    },
    cardDate: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "700",
        marginTop: -4,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    addressText: {
        flex: 1,
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
        gap: 10,
    },
    totalLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    totalValue: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "900",
        marginTop: 2,
    },
    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cancelButton: {
        minHeight: 42,
        borderRadius: 999,
        backgroundColor: "#fff1f2",
        borderWidth: 1.5,
        borderColor: "#fda4af",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingHorizontal: 14,
    },
    cancelButtonText: {
        color: "#e11d48",
        fontSize: 11,
        fontWeight: "900",
    },
    trackButton: {
        minHeight: 42,
        borderRadius: 999,
        backgroundColor: COLORS.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 16,
    },
    trackButtonText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "900",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        padding: 28,
        borderRadius: 22,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#fed7aa",
        backgroundColor: "#fff",
        marginTop: 8,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "900",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 19,
        textAlign: "center",
    },
    emptyButton: {
        minHeight: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginTop: 8,
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 1.1,
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

export default MyOrdersScreen;
