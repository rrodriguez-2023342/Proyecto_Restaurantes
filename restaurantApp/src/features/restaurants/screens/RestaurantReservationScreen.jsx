import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { getTablesByRestaurant } from "../../../shared/api/tables";
import { createReservation, updateReservation } from "../../../shared/api/reservations";
import { getRestaurantById } from "../../../shared/api/restaurants";
import { useAuthStore } from "../../../shared/store/authStore";
import { useToast } from "../../../shared/components/Toast";

const getList = (data, key) => data?.data || data?.[key] || data || [];

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const buildDateOptions = () => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        return {
            key: toDateKey(date),
            day: date.toLocaleDateString("es-GT", { weekday: "short" }),
            label: date.toLocaleDateString("es-GT", { day: "numeric", month: "short" }),
        };
    });
};

const generateTimeSlots = (start = "08:00", end = "22:00") => {
    const slots = [];
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    let hour = Number.isFinite(startHour) ? startHour : 8;
    let minute = Number.isFinite(startMinute) ? startMinute : 0;
    const finalHour = Number.isFinite(endHour) ? endHour : 22;
    const finalMinute = Number.isFinite(endMinute) ? endMinute : 0;

    while (hour < finalHour || (hour === finalHour && minute < finalMinute)) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        minute += 30;
        if (minute >= 60) {
            minute = 0;
            hour += 1;
        }
    }

    return slots;
};

const buildGuatemalaReservationDate = (dateKey, time) => `${dateKey}T${time}:00-06:00`;

const getRelationId = (value) => value?._id || value?.id || value;

const getGuatemalaDateParts = (dateValue) => {
    if (!dateValue) return { dateKey: "", time: "" };

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Guatemala",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date(dateValue));

    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return {
        dateKey: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}`,
    };
};

const RestaurantReservationScreen = ({ navigation, route }) => {
    const reservation = route.params?.reservation;
    const initialRestaurant = route.params?.restaurant || reservation?.restaurante;
    const restaurantId = route.params?.restaurantId || getRelationId(initialRestaurant) || getRelationId(reservation?.restaurante);
    const reservationId = getRelationId(reservation);
    const isEditing = Boolean(reservationId);
    const [restaurant, setRestaurant] = useState(initialRestaurant || null);
    const restaurantName = restaurant?.nombre || restaurant?.name || initialRestaurant?.nombre || initialRestaurant?.name || "Restaurante";
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToast();
    const [tables, setTables] = useState([]);
    const reservationParts = useMemo(() => getGuatemalaDateParts(reservation?.fecha), [reservation?.fecha]);
    const [selectedTable, setSelectedTable] = useState(() => getRelationId(reservation?.mesa) || "");
    const [selectedDate, setSelectedDate] = useState(() => reservationParts.dateKey || "");
    const [selectedTime, setSelectedTime] = useState(() => reservationParts.time || "");
    const [guests, setGuests] = useState(() => reservation?.cantidadPersonas || reservation?.mesa?.capacidad || 2);
    const [clientName, setClientName] = useState(user?.name || user?.nombre || "");
    const [notes, setNotes] = useState("");
    const [loadingTables, setLoadingTables] = useState(true);
    const [loadingRestaurant, setLoadingRestaurant] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [successReservation, setSuccessReservation] = useState(null);

    const dateOptions = useMemo(buildDateOptions, []);
    const timeSlots = useMemo(
        () => generateTimeSlots(restaurant?.horario?.apertura, restaurant?.horario?.cierre),
        [restaurant?.horario?.apertura, restaurant?.horario?.cierre]
    );

    useEffect(() => {
        if (!selectedDate && dateOptions.length > 0) setSelectedDate(dateOptions[0].key);
        if (timeSlots.length > 0 && (!selectedTime || !timeSlots.includes(selectedTime))) {
            setSelectedTime(timeSlots[0]);
        }
    }, [dateOptions, selectedDate, selectedTime, timeSlots]);

    useEffect(() => {
        const loadTables = async () => {
            if (!restaurantId) {
                setError("No se encontro el restaurante.");
                setLoadingTables(false);
                return;
            }

            try {
                setLoadingTables(true);
                setError("");
                const { data } = await getTablesByRestaurant(restaurantId);
                setTables(getList(data, "mesas"));
            } catch (err) {
                setError(err.response?.data?.message || "No se pudieron cargar las mesas.");
            } finally {
                setLoadingTables(false);
            }
        };

        loadTables();
    }, [restaurantId]);

    useEffect(() => {
        const loadRestaurant = async () => {
            if (!restaurantId) return;

            try {
                setLoadingRestaurant(true);
                const { data } = await getRestaurantById(restaurantId);
                setRestaurant(data?.data || data?.restaurante || data || initialRestaurant || null);
            } catch {
                setRestaurant(initialRestaurant || null);
            } finally {
                setLoadingRestaurant(false);
            }
        };

        loadRestaurant();
    }, [initialRestaurant, restaurantId]);

    const selectedTableData = tables.find((table) => String(table._id || table.id) === String(selectedTable));
    const errors = {
        clientName: submitted && !clientName.trim(),
        table: submitted && !selectedTable,
        date: submitted && !selectedDate,
        time: submitted && !selectedTime,
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setError("");

        if (!clientName.trim() || !restaurantId || !selectedTable || !selectedDate || !selectedTime) {
            return;
        }

        const payload = {
            restaurante: restaurantId,
            mesa: selectedTable,
            fecha: buildGuatemalaReservationDate(selectedDate, selectedTime),
            cantidadPersonas: guests,
            notas: notes,
            nombre: clientName.trim(),
        };

        try {
            setSubmitting(true);
            const { data } = isEditing
                ? await updateReservation(reservationId, payload)
                : await createReservation(payload);
            setSuccessReservation(data?.data || data?.reservacion || payload);
            showToast({
                type: "success",
                title: isEditing ? "Reserva actualizada" : "Reserva creada",
                message: `Tu mesa en ${restaurantName} quedo lista.`,
            });
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || "No se pudo crear la reservacion.";
            const freeTables = getList(err.response?.data?.mesasLibres, "mesas");
            if (freeTables.length > 0) {
                setTables(freeTables);
                setSelectedTable("");
            }
            setError(message);
            showToast({ type: "error", title: "No se pudo reservar", message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                        <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={styles.headerCopy}>
                        <Text style={styles.kicker}>{isEditing ? "Modificar reserva" : "Reservar mesa"}</Text>
                        <Text style={styles.title} numberOfLines={1}>{restaurantName}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Titular de la reserva</Text>
                        <TextInput
                            value={clientName}
                            onChangeText={setClientName}
                            placeholder="Nombre de quien reserva"
                            placeholderTextColor="#94a3b8"
                            style={[styles.input, errors.clientName && styles.inputError]}
                        />
                        {errors.clientName ? <Text style={styles.fieldError}>Ingresa un nombre.</Text> : null}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionLabel}>Personas</Text>
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => {
                                        setSelectedTable("");
                                        setGuests((value) => Math.max(1, value - 1));
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="remove" size={18} color={COLORS.text} />
                                </TouchableOpacity>
                                <Text style={styles.guestsText}>{guests}</Text>
                                <TouchableOpacity
                                    style={styles.stepperButton}
                                    onPress={() => {
                                        setSelectedTable("");
                                        setGuests((value) => Math.min(12, value + 1));
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="add" size={18} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionLabel}>Mesa ideal</Text>
                            {loadingTables ? <ActivityIndicator color={COLORS.primary} /> : null}
                        </View>
                        {tables.length > 0 ? (
                            <View style={styles.tableGrid}>
                                {tables.map((table) => {
                                    const tableId = table._id || table.id;
                                    const capacity = Number(table.capacidad || 0);
                                    const selected = String(selectedTable) === String(tableId);
                                    const disabled = table.disponibilidad === false || capacity < guests;

                                    return (
                                        <TouchableOpacity
                                            key={String(tableId)}
                                            disabled={disabled && !selected}
                                            style={[
                                                styles.tableCard,
                                                selected && styles.tableCardSelected,
                                                disabled && !selected && styles.tableCardDisabled,
                                            ]}
                                            onPress={() => setSelectedTable(tableId)}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={[styles.tableNumber, selected && styles.tableTextSelected]}>
                                                Mesa {table.numeroMesa || "S/N"}
                                            </Text>
                                            <Text style={[styles.tableCapacity, selected && styles.tableSubtextSelected]}>
                                                {capacity} personas
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            !loadingTables && <Text style={styles.emptyText}>No hay mesas registradas para este restaurante.</Text>
                        )}
                        {errors.table ? <Text style={styles.fieldError}>Selecciona una mesa.</Text> : null}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Fecha</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
                            {dateOptions.map((item) => {
                                const selected = selectedDate === item.key;
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[styles.dateOption, selected && styles.dateOptionSelected]}
                                        onPress={() => setSelectedDate(item.key)}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[styles.dateDay, selected && styles.optionTextSelected]}>{item.day}</Text>
                                        <Text style={[styles.dateLabel, selected && styles.optionTextSelected]}>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {errors.date ? <Text style={styles.fieldError}>Selecciona una fecha.</Text> : null}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Hora</Text>
                        <Text style={styles.helperText}>
                            Horario del restaurante: {restaurant?.horario?.apertura || "08:00"} a {restaurant?.horario?.cierre || "22:00"}
                        </Text>
                        {loadingRestaurant ? <ActivityIndicator color={COLORS.primary} /> : null}
                        <View style={styles.timeGrid}>
                            {timeSlots.map((time) => {
                                const selected = selectedTime === time;
                                return (
                                    <TouchableOpacity
                                        key={time}
                                        style={[styles.timeOption, selected && styles.timeOptionSelected]}
                                        onPress={() => setSelectedTime(time)}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[styles.timeText, selected && styles.optionTextSelected]}>{time}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.time ? <Text style={styles.fieldError}>Selecciona una hora.</Text> : null}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Detalles especiales</Text>
                        <TextInput
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Alergias, aniversario, mesa junto a la ventana..."
                            placeholderTextColor="#94a3b8"
                            style={[styles.input, styles.notesInput]}
                            multiline
                        />
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Resumen</Text>
                        <Text style={styles.summaryTitle}>{selectedTableData ? `Mesa ${selectedTableData.numeroMesa}` : "Mesa pendiente"}</Text>
                        <Text style={styles.summaryText}>
                            {guests} personas - {selectedDate || "fecha"} - {selectedTime || "hora"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.9}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>{isEditing ? "GUARDAR CAMBIOS" : "CONFIRMAR RESERVA"}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    transparent
                    visible={successReservation !== null}
                    animationType="fade"
                    onRequestClose={() => {
                        setSuccessReservation(null);
                        navigation.navigate("UserReservations");
                    }}
                >
                    <View style={styles.successBackdrop}>
                        <View style={styles.successCard}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark" size={34} color="#fff" />
                            </View>
                            <Text style={styles.successTitle}>{isEditing ? "Reserva actualizada" : "Reserva confirmada"}</Text>
                            <Text style={styles.successText}>
                                {restaurantName} preparo tu mesa para {selectedDate} a las {selectedTime}.
                            </Text>

                            <View style={styles.successDetails}>
                                <View style={styles.successDetailItem}>
                                    <Text style={styles.successDetailLabel}>Mesa</Text>
                                    <Text style={styles.successDetailValue}>
                                        {selectedTableData?.numeroMesa || successReservation?.mesa?.numeroMesa || "Asignada"}
                                    </Text>
                                </View>
                                <View style={styles.successDetailItem}>
                                    <Text style={styles.successDetailLabel}>Capacidad</Text>
                                    <Text style={styles.successDetailValue}>
                                        {selectedTableData?.capacidad || successReservation?.mesa?.capacidad || guests}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.successPrimaryButton}
                                onPress={() => {
                                    setSuccessReservation(null);
                                    navigation.navigate("UserReservations");
                                }}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.successPrimaryButtonText}>VER MIS RESERVACIONES</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
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
        fontSize: 20,
        fontWeight: "900",
        marginTop: 2,
    },
    content: {
        padding: 16,
        paddingBottom: 34,
        gap: 16,
    },
    errorText: {
        color: "#991b1b",
        backgroundColor: "#fff1f2",
        borderRadius: 14,
        padding: 12,
        fontWeight: "700",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 12,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    sectionLabel: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "900",
    },
    input: {
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingHorizontal: 12,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "700",
    },
    inputError: {
        borderColor: COLORS.error,
    },
    notesInput: {
        minHeight: 96,
        paddingTop: 12,
        textAlignVertical: "top",
    },
    fieldError: {
        color: COLORS.error,
        fontSize: 11,
        fontWeight: "800",
    },
    helperText: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "700",
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: COLORS.surfaceMuted,
        borderRadius: 999,
        padding: 4,
    },
    stepperButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    guestsText: {
        width: 26,
        textAlign: "center",
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
    },
    tableGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    tableCard: {
        width: "47%",
        minHeight: 76,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        justifyContent: "center",
        padding: 12,
    },
    tableCardSelected: {
        borderColor: COLORS.primaryDark,
        backgroundColor: COLORS.primaryDark,
    },
    tableCardDisabled: {
        opacity: 0.42,
    },
    tableNumber: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "900",
    },
    tableCapacity: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
    },
    tableTextSelected: {
        color: "#fff",
    },
    tableSubtextSelected: {
        color: "rgba(255,255,255,0.68)",
    },
    emptyText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "700",
    },
    optionRow: {
        gap: 8,
    },
    dateOption: {
        minWidth: 82,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingHorizontal: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    dateOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    dateDay: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    dateLabel: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
        marginTop: 4,
    },
    timeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    timeOption: {
        minWidth: 72,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingHorizontal: 12,
        paddingVertical: 11,
        alignItems: "center",
    },
    timeOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    timeText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
    },
    optionTextSelected: {
        color: "#fff",
    },
    summaryCard: {
        borderRadius: 18,
        backgroundColor: COLORS.primaryDark,
        padding: 18,
    },
    summaryLabel: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.4,
    },
    summaryTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "900",
        marginTop: 6,
    },
    summaryText: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 13,
        fontWeight: "700",
        marginTop: 4,
    },
    submitButton: {
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1.4,
    },
    successBackdrop: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.78)",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    successCard: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 22,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    successIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.success,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    successTitle: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: "900",
        textAlign: "center",
    },
    successText: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 20,
        textAlign: "center",
        marginTop: 8,
    },
    successDetails: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    successDetailItem: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 14,
    },
    successDetailLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.1,
    },
    successDetailValue: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
        marginTop: 4,
    },
    successPrimaryButton: {
        width: "100%",
        minHeight: 50,
        borderRadius: 16,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 18,
    },
    successPrimaryButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1.2,
    },
});

export default RestaurantReservationScreen;
