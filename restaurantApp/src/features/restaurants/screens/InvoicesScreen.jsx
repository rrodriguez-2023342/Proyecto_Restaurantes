import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
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
import { getInvoices } from "../../../shared/api/invoices";

const getList = (data) => data?.data || data?.facturas || data || [];

const formatDate = (date) => {
    if (!date) return "N/A";
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "N/A";
    return value.toLocaleDateString("es-GT", {
        timeZone: "America/Guatemala",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const normalizeDateInput = (value) => String(value || "").trim();

const matchesDate = (invoice, dateFilter) => {
    const normalized = normalizeDateInput(dateFilter);
    if (!normalized) return true;

    const invoiceDate = new Date(invoice.fechaEmision || invoice.createdAt);
    if (Number.isNaN(invoiceDate.getTime())) return false;

    const [year, month, day] = normalized.split("-").map(Number);
    if (!year || !month || !day) return false;

    return (
        invoiceDate.getUTCFullYear() === year &&
        invoiceDate.getUTCMonth() + 1 === month &&
        invoiceDate.getUTCDate() === day
    );
};

const getInvoiceTotal = (invoice) => Number(invoice.total ?? invoice.subtotal ?? 0);

const getClientName = (invoice) =>
    invoice.cliente?.nombre ||
    invoice.pedido?.cliente ||
    invoice.pedido?.usuario?.nombre ||
    invoice.correoCliente ||
    "Consumidor final";

const groupInvoices = (invoices) => {
    const groups = [];

    for (const invoice of invoices) {
        const invoiceTime = new Date(invoice.fechaEmision || invoice.createdAt || 0).getTime();
        const matchingGroup = groups.find((group) => {
            const groupTime = new Date(group.fechaEmision || group.createdAt || 0).getTime();
            return Math.abs(groupTime - invoiceTime) < 5000;
        });

        if (matchingGroup) {
            matchingGroup.subInvoices.push(invoice);
            matchingGroup.total = getInvoiceTotal(matchingGroup) + getInvoiceTotal(invoice);
        } else {
            groups.push({
                ...invoice,
                subInvoices: [invoice],
            });
        }
    }

    return groups;
};

const InvoicesScreen = ({ navigation }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const loadInvoices = useCallback(async ({ refresh = false } = {}) => {
        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const { data } = await getInvoices({ limit: 100 });
            setInvoices(getList(data));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar tus facturas.");
            setInvoices([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadInvoices().catch(() => null);
        const unsubscribe = navigation.addListener("focus", () => {
            loadInvoices({ refresh: true }).catch(() => null);
        });
        return unsubscribe;
    }, [navigation, loadInvoices]);

    const visibleInvoices = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const filtered = invoices.filter((invoice) => {
            const code = String(invoice._id || invoice.id || "").toLowerCase();
            const client = getClientName(invoice).toLowerCase();
            const searchMatch = !query || code.includes(query) || client.includes(query);
            return searchMatch && matchesDate(invoice, dateFilter);
        });

        return groupInvoices(filtered).sort(
            (a, b) => new Date(b.fechaEmision || b.createdAt || 0) - new Date(a.fechaEmision || a.createdAt || 0)
        );
    }, [invoices, searchTerm, dateFilter]);

    const totalAmount = useMemo(
        () => visibleInvoices.reduce((acc, invoice) => acc + getInvoiceTotal(invoice), 0),
        [visibleInvoices]
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Comprobantes</Text>
                    <Text style={styles.title}>Mis facturas</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={() => loadInvoices({ refresh: true })} activeOpacity={0.85}>
                    <Ionicons name="refresh" size={19} color={COLORS.surface} />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                    <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.summaryCopy}>
                    <Text style={styles.summaryLabel}>Total consultado</Text>
                    <Text style={styles.summaryValue}>Q{totalAmount.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryCount}>
                    <Text style={styles.summaryCountValue}>{visibleInvoices.length}</Text>
                    <Text style={styles.summaryCountLabel}>Facturas</Text>
                </View>
            </View>

            <View style={styles.filtersCard}>
                <View style={styles.inputBox}>
                    <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
                    <TextInput
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholder="Buscar por ID o cliente"
                        placeholderTextColor={COLORS.textLight}
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputBox}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.textLight} />
                    <TextInput
                        value={dateFilter}
                        onChangeText={setDateFilter}
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor={COLORS.textLight}
                        style={styles.input}
                    />
                    {dateFilter ? (
                        <TouchableOpacity style={styles.clearDateButton} onPress={() => setDateFilter("")} activeOpacity={0.85}>
                            <Ionicons name="close" size={16} color={COLORS.textLight} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando facturas...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => loadInvoices({ refresh: true })} tintColor={COLORS.primary} />
                    }
                >
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {visibleInvoices.length > 0 ? (
                        visibleInvoices.map((invoice) => (
                            <InvoiceCard
                                key={String(invoice._id || invoice.id)}
                                invoice={invoice}
                                onPress={() =>
                                    navigation.navigate("InvoiceDetail", {
                                        invoiceId: invoice._id || invoice.id,
                                        invoice,
                                    })
                                }
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={34} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>No se encontraron facturas</Text>
                            <Text style={styles.emptySubtitle}>
                                Prueba con otro ID, cliente o fecha de emision.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const InvoiceCard = ({ invoice, onPress }) => {
    const id = String(invoice._id || invoice.id || "");
    const code = id.slice(0, 10).toUpperCase();
    const total = getInvoiceTotal(invoice);
    const subCount = invoice.subInvoices?.length || 1;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.cardTop}>
                <View style={styles.cardTitleRow}>
                    <View style={styles.cardIcon}>
                        <Ionicons name="receipt-outline" size={19} color={COLORS.primary} />
                    </View>
                    <View style={styles.cardCodeBox}>
                        <Text style={styles.cardCode}>#{code}</Text>
                        <Text style={styles.cardType}>{subCount > 1 ? `${subCount} comprobantes` : "Factura electronica"}</Text>
                    </View>
                </View>
                <Text style={styles.cardTotal}>Q{total.toFixed(2)}</Text>
            </View>

            <View style={styles.cardMetaRow}>
                <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.cardDate}>{formatDate(invoice.fechaEmision || invoice.createdAt)}</Text>
                </View>
                <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>Ver detalle</Text>
                    <Ionicons name="arrow-forward" size={13} color={COLORS.surface} />
                </View>
            </View>
        </TouchableOpacity>
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
        backgroundColor: COLORS.surface,
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
    summaryCard: {
        marginHorizontal: 16,
        backgroundColor: COLORS.primaryDark,
        borderRadius: 22,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    summaryIcon: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    summaryCopy: {
        flex: 1,
    },
    summaryLabel: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    summaryValue: {
        color: COLORS.surface,
        fontSize: 24,
        fontWeight: "900",
        marginTop: 2,
    },
    summaryCount: {
        alignItems: "flex-end",
    },
    summaryCountValue: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: "900",
    },
    summaryCountLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
    },
    filtersCard: {
        margin: 16,
        marginBottom: 8,
        gap: 10,
    },
    inputBox: {
        minHeight: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "700",
    },
    clearDateButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
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
        color: COLORS.error,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.error,
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        fontWeight: "700",
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 14,
        shadowColor: COLORS.ink,
        shadowOpacity: 0.04,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    cardTitleRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cardIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.accentSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    cardCodeBox: {
        flex: 1,
    },
    cardCode: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
    },
    cardType: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 2,
    },
    cardTotal: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
    },
    cardMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    cardMeta: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    cardDate: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "700",
        flexShrink: 1,
    },
    detailBadge: {
        minHeight: 34,
        borderRadius: 999,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        backgroundColor: COLORS.primaryDark,
    },
    detailBadgeText: {
        color: COLORS.surface,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        padding: 28,
        borderRadius: 22,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
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
});

export default InvoicesScreen;
