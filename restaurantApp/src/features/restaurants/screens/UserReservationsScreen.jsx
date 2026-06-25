import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { cancelReservation, getReservations } from "../../../shared/api/reservations";

const getList = (data, key) => data?.data || data?.[key] || data || [];

const statusConfig = {
    PENDIENTE: { label: "Pendiente", color: "#d97706", bg: "#fff7ed", icon: "time-outline" },
    CONFIRMADA: { label: "Confirmada", color: "#16a34a", bg: "#f0fdf4", icon: "checkmark-circle-outline" },
    CANCELADA: { label: "Cancelada", color: "#dc2626", bg: "#fff1f2", icon: "close-circle-outline" },
    COMPLETADA: { label: "Completada", color: "#2563eb", bg: "#eff6ff", icon: "shield-checkmark-outline" },
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-GT", {
        timeZone: "America/Guatemala",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const formatTime = (date) =>
    new Date(date).toLocaleTimeString("es-GT", {
        timeZone: "America/Guatemala",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

const UserReservationsScreen = ({ navigation }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const sortedReservations = useMemo(
        () => [...reservations].sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0)),
        [reservations]
    );

    const loadReservations = useCallback(async ({ refresh = false } = {}) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const { data } = await getReservations({ limit: 100 });
            setReservations(getList(data, "reservaciones"));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar tus reservaciones.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleCancel = (reservation) => {
        setSelectedReservation(reservation);
        setCancelModalVisible(true);
    };

    const handleConfirmCancel = async () => {
        if (!selectedReservation) return;
        const id = selectedReservation._id || selectedReservation.id;
        setSavingId(id);
        setCancelModalVisible(false);

        try {
            await cancelReservation(id);
            setReservations((prev) =>
                prev.map((r) => (r._id || r.id) === id ? { ...r, estado: "CANCELADA" } : r)
            );
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cancelar la reservación.");
        } finally {
            setSavingId(null);
            setSelectedReservation(null);
        }
    };

    const handleCloseCancelModal = () => {
        setCancelModalVisible(false);
        setSelectedReservation(null);
    };

    useEffect(() => {
        loadReservations().catch(() => null);
    }, [loadReservations]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Agenda</Text>
                    <Text style={styles.title}>Mis reservaciones</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={() => loadReservations({ refresh: true })} activeOpacity={0.85}>
                    <Ionicons name="refresh" size={19} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando reservaciones...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadReservations({ refresh: true })}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {sortedReservations.length > 0 ? (
                        sortedReservations.map((reservation) => {
                            const reservationId = String(reservation._id || reservation.id);
                            return (
                                <ReservationCard
                                    key={reservationId}
                                    reservation={reservation}
                                    isSaving={savingId === reservationId}
                                    onEdit={() => navigation.navigate("RestaurantReservation", {
                                        reservation,
                                        restaurant: reservation.restaurante,
                                        restaurantId: reservation.restaurante?._id || reservation.restaurante?.id || reservation.restaurante,
                                    })}
                                    onCancel={() => handleCancel(reservation)}
                                />
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={34} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>Aun no tienes reservaciones</Text>
                            <Text style={styles.emptySubtitle}>Cuando reserves una mesa, aparecera aqui con todos los detalles.</Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => navigation.navigate("RestaurantsHome")}
                                activeOpacity={0.88}
                            >
                                <Text style={styles.emptyButtonText}>EXPLORAR RESTAURANTES</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}

            <Modal visible={cancelModalVisible} transparent animationType="fade" onRequestClose={handleCloseCancelModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cancelar reservación</Text>
                        <Text style={styles.modalMessage}>¿Estás seguro de que deseas cancelar esta reservación?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={handleCloseCancelModal} activeOpacity={0.85}>
                                <Text style={styles.modalCancelText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmCancel} activeOpacity={0.85}>
                                <Text style={styles.modalConfirmText}>Sí, cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const ReservationCard = ({ reservation, onEdit, onCancel, isSaving }) => {
    const status = statusConfig[reservation.estado] || statusConfig.PENDIENTE;
    const restaurantName = reservation.restaurante?.nombre || "Restaurante";
    const tableNumber = reservation.mesa?.numeroMesa || "S/N";
    const guests = reservation.cantidadPersonas || reservation.mesa?.capacidad || 1;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Ionicons name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
                <Text style={styles.cardCode}>#{String(reservation._id || reservation.id || "").slice(-6) || "reserva"}</Text>
            </View>

            <Text style={styles.restaurantName} numberOfLines={2}>{restaurantName}</Text>

            <View style={styles.detailGrid}>
                <DetailItem icon="restaurant-outline" label="Mesa" value={`Mesa ${tableNumber}`} />
                <DetailItem icon="people-outline" label="Personas" value={String(guests)} />
                <DetailItem icon="calendar-outline" label="Fecha" value={formatDate(reservation.fecha)} wide />
                <DetailItem icon="time-outline" label="Hora" value={formatTime(reservation.fecha)} />
            </View>

            {reservation.estado !== "CANCELADA" && reservation.estado !== "COMPLETADA" ? (
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.88} disabled={isSaving}>
                        <Ionicons name="close-outline" size={17} color="#e11d48" />
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cancelButtonText}>{isSaving ? "Cancelando..." : "Cancelar"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.88} disabled={isSaving}>
                        <Ionicons name="create-outline" size={17} color={COLORS.text} />
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.editButtonText}>Modificar</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );
};

const DetailItem = ({ icon, label, value, wide }) => (
    <View style={[styles.detailItem, wide && styles.detailItemWide]}>
        <View style={styles.detailIcon}>
            <Ionicons name={icon} size={15} color={COLORS.accent} />
        </View>
        <View style={styles.detailCopy}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
        </View>
    </View>
);

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
        gap: 14,
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
        letterSpacing: 1,
    },
    cardCode: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "800",
    },
    restaurantName: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "900",
        lineHeight: 24,
    },
    detailGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    detailItem: {
        width: "47%",
        minHeight: 72,
        flexDirection: "row",
        gap: 10,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    detailItemWide: {
        width: "100%",
    },
    detailIcon: {
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: COLORS.accentSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    detailCopy: {
        flex: 1,
    },
    detailLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    detailValue: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "800",
        lineHeight: 18,
        marginTop: 3,
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
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        width: "100%",
        maxWidth: 380,
        borderRadius: 22,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 22,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
        marginBottom: 8,
    },
    modalMessage: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    modalCancelText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    modalConfirmButton: {
        flex: 1,
        minHeight: 44,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    modalConfirmText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.3,
    },
    editButton: {
        flex: 1,
        minHeight: 44,
        minWidth: 0,
        borderRadius: 999,
        backgroundColor: "#fff",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 12,
        overflow: "hidden",
    },
    editButtonText: {
        color: COLORS.text,
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.2,
        textAlign: "center",
    },
    actionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    cancelButton: {
        flex: 1,
        minHeight: 44,
        minWidth: 0,
        borderRadius: 999,
        backgroundColor: "#fff1f2",
        borderWidth: 1.5,
        borderColor: "#fda4af",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 12,
        overflow: "hidden",
    },
    cancelButtonText: {
        color: "#e11d48",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.4,
        textAlign: "center",
    },
});

export default UserReservationsScreen;
