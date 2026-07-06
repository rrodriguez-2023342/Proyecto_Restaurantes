import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { useToast } from "../../../shared/components/Toast";
import { getInvoiceById, getInvoices, sendInvoiceByEmail } from "../../../shared/api/invoices";
import { getOrderDetailByOrderId } from "../../../shared/api/orders";
import { getRestaurantById } from "../../../shared/api/restaurants";

const getList = (data) => data?.data || data?.facturas || data || [];

const formatDate = (date) => {
    if (!date) return "N/A";
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return "N/A";
    return value.toLocaleDateString("es-GT", {
        timeZone: "America/Guatemala",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getInvoiceTotal = (invoice) => Number(invoice?.total ?? invoice?.subtotal ?? 0);

const getOrderId = (invoice) => invoice?.pedido?._id || invoice?.pedido?.id || invoice?.pedido;

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
                    item.descripcion ||
                    "Articulo de consumo",
                cantidad,
                precio,
                subtotal: Number(item.subtotal || cantidad * precio),
            };
        });
    });
};

const getRelatedInvoices = (target, invoices) => {
    const targetTime = new Date(target?.fechaEmision || target?.createdAt || 0).getTime();
    if (!targetTime) return [target].filter(Boolean);

    const related = invoices.filter((invoice) => {
        const invoiceTime = new Date(invoice.fechaEmision || invoice.createdAt || 0).getTime();
        return Math.abs(invoiceTime - targetTime) < 5000;
    });

    return related.length > 0 ? related : [target].filter(Boolean);
};

const resolveRestaurantName = async (invoice) => {
    const restaurant = invoice?.restaurante || invoice?.pedido?.restaurante;
    if (restaurant?.nombre || restaurant?.name) return restaurant.nombre || restaurant.name;

    const restaurantId = typeof restaurant === "string" ? restaurant : restaurant?._id || restaurant?.id;
    if (!restaurantId) return "";

    try {
        const { data } = await getRestaurantById(restaurantId);
        const restaurantData = data?.data || data?.restaurante || data;
        return restaurantData?.nombre || restaurantData?.name || "";
    } catch {
        return "";
    }
};

const InvoiceDetailScreen = ({ navigation, route }) => {
    const invoiceId = route.params?.invoiceId || route.params?.invoice?._id || route.params?.invoice?.id;
    const { showToast } = useToast();

    const [invoice, setInvoice] = useState(route.params?.invoice || null);
    const [relatedInvoices, setRelatedInvoices] = useState(route.params?.invoice?.subInvoices || []);
    const [items, setItems] = useState([]);
    const [restaurantName, setRestaurantName] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const loadInvoice = useCallback(async () => {
        if (!invoiceId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const invoiceRes = await getInvoiceById(invoiceId);
            const freshInvoice = invoiceRes?.data?.data || invoiceRes?.data?.factura || invoiceRes?.data || route.params?.invoice || null;
            if (!freshInvoice) {
                setInvoice(null);
                return;
            }

            let related = [freshInvoice];
            try {
                const allInvoicesRes = await getInvoices({ limit: 100 });
                related = getRelatedInvoices(freshInvoice, getList(allInvoicesRes.data));
            } catch {
                related = route.params?.invoice?.subInvoices || [freshInvoice];
            }

            const allItems = [];
            for (const relatedInvoice of related) {
                const orderId = getOrderId(relatedInvoice);
                if (!orderId) continue;

                try {
                    const detailRes = await getOrderDetailByOrderId(orderId);
                    const detailPayload = detailRes?.data?.data || detailRes?.data?.detallePedidos || detailRes?.data || null;
                    allItems.push(...extractItems(detailPayload));
                } catch {
                    allItems.push(...extractItems(relatedInvoice.items || []));
                }
            }

            const names = await Promise.all(related.map(resolveRestaurantName));
            const uniqueNames = names.filter(Boolean).filter((value, index, list) => list.indexOf(value) === index);
            const total = related.reduce((acc, item) => acc + getInvoiceTotal(item), 0);
            const subtotal = related.reduce((acc, item) => acc + Number(item.subtotal ?? item.total ?? 0), 0);
            const propina = related.reduce((acc, item) => acc + Number(item.propina ?? 0), 0);

            setInvoice({
                ...freshInvoice,
                total,
                subtotal,
                propina,
            });
            setRelatedInvoices(related);
            setItems(allItems);
            setRestaurantName(uniqueNames.join(", "));
        } catch (err) {
            showToast({
                type: "error",
                title: "Error",
                message: err.response?.data?.message || "No se pudo cargar la factura.",
            });
        } finally {
            setLoading(false);
        }
    }, [invoiceId, route.params?.invoice, showToast]);

    useEffect(() => {
        loadInvoice();
    }, [loadInvoice]);

    const handleSendEmail = async () => {
        const targets = relatedInvoices.length > 0 ? relatedInvoices : [invoice];
        const ids = targets.map((item) => item?._id || item?.id).filter(Boolean);
        if (ids.length === 0) return;

        try {
            setSending(true);
            await Promise.all(ids.map((id) => sendInvoiceByEmail(id)));
            showToast({
                type: "success",
                title: "Correo solicitado",
                message: ids.length > 1 ? "Se enviaran las facturas relacionadas." : "Se enviara la factura al correo registrado.",
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "No se pudo enviar",
                message: err.response?.data?.message || "Intenta de nuevo en unos minutos.",
            });
        } finally {
            setSending(false);
        }
    };

    const clientName =
        invoice?.pedido?.cliente ||
        invoice?.cliente?.nombre ||
        invoice?.pedido?.usuario?.nombre ||
        "Consumidor final";
    const clientEmail = invoice?.correoCliente || invoice?.pedido?.email || "Sin correo registrado";
    const clientPhone = invoice?.pedido?.telefono || "N/A";
    const displayRestaurant = restaurantName || invoice?.restaurante?.nombre || invoice?.pedido?.restaurante?.nombre || "Kinal Eats";
    const code = String(invoice?._id || invoiceId || "").slice(0, 12).toUpperCase();

    const totals = useMemo(
        () => ({
            subtotal: Number(invoice?.subtotal || invoice?.total || 0),
            propina: Number(invoice?.propina || 0),
            total: Number(invoice?.total || invoice?.subtotal || 0),
        }),
        [invoice]
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeAreaLight}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Sincronizando factura...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!invoice) {
        return (
            <SafeAreaView style={styles.safeAreaLight}>
                <View style={styles.centerState}>
                    <Ionicons name="receipt-outline" size={36} color={COLORS.primary} />
                    <Text style={styles.emptyTitle}>Factura no encontrada</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()} activeOpacity={0.9}>
                        <Text style={styles.primaryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.heroTopRow}>
                        <TouchableOpacity style={styles.heroBack} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                            <Ionicons name="chevron-back" size={22} color={COLORS.surface} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.heroSend} onPress={handleSendEmail} activeOpacity={0.85} disabled={sending}>
                            <Ionicons name="mail-outline" size={17} color={COLORS.surface} />
                            <Text style={styles.heroSendText}>{sending ? "Enviando..." : "Correo"}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.heroKicker}>Factura electronica</Text>
                    <Text style={styles.heroTitle}>#{code}</Text>
                    <Text style={styles.heroDate}>{formatDate(invoice.fechaEmision || invoice.createdAt)}</Text>
                </View>

                <View style={styles.body}>
                    <View style={styles.ticket}>
                        <View style={styles.ticketHeader}>
                            <View style={styles.ticketLogo}>
                                <Ionicons name="restaurant" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.ticketTitle}>TICKET</Text>
                            <Text style={styles.ticketSubtitle}>Copia digital de consumo</Text>
                        </View>

                        <View style={styles.ticketSectionCentered}>
                            <Text style={styles.restaurantName} numberOfLines={2}>{displayRestaurant}</Text>
                            <Text style={styles.restaurantLocation}>Guatemala, Centro America</Text>
                            <Text style={styles.invoiceCode}>FACTURA: {code}</Text>
                        </View>

                        <View style={styles.infoSection}>
                            <InfoRow label="Fecha" value={formatDate(invoice.fechaEmision || invoice.createdAt)} />
                            <InfoRow label="Estado" value={invoice.estado || "PAGADA"} strong />
                            <InfoRow label="Metodo" value={invoice.metodoPago || "Transaccion electronica"} />
                        </View>

                        <View style={styles.clientSection}>
                            <Text style={styles.sectionLabel}>Datos del cliente</Text>
                            <View style={styles.clientRow}>
                                <Ionicons name="person-outline" size={17} color={COLORS.textLight} />
                                <View style={styles.clientCopy}>
                                    <Text style={styles.clientName}>{clientName}</Text>
                                    <Text style={styles.clientEmail}>{clientEmail}</Text>
                                </View>
                            </View>
                            <View style={styles.clientRow}>
                                <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                                <Text style={styles.clientPhone}>TEL: {clientPhone}</Text>
                            </View>
                        </View>

                        <View style={styles.itemsSection}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.sectionLine} />
                                <Text style={styles.sectionTitle}>Detalle de compra</Text>
                                <View style={styles.sectionLine} />
                            </View>

                            {items.length > 0 ? (
                                items.map((item) => (
                                    <View key={item.key} style={styles.itemRow}>
                                        <View style={styles.itemCopy}>
                                            <Text style={styles.itemName} numberOfLines={2}>{item.nombre}</Text>
                                            <Text style={styles.itemQty}>{item.cantidad} x Q{item.precio.toFixed(2)}</Text>
                                        </View>
                                        <Text style={styles.itemTotal}>Q{item.subtotal.toFixed(2)}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.noItemsBox}>
                                    <Ionicons name="receipt-outline" size={28} color={COLORS.textLight} />
                                    <Text style={styles.noItemsText}>Sin articulos registrados</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.totalsSection}>
                            <InfoRow label="Subtotal" value={`Q${totals.subtotal.toFixed(2)}`} />
                            <InfoRow label="Propina" value={`Q${totals.propina.toFixed(2)}`} />
                        </View>

                        <View style={styles.totalFinal}>
                            <Text style={styles.totalFinalLabel}>Total a pagar</Text>
                            <Text style={styles.totalFinalValue}>Q{totals.total.toFixed(2)}</Text>
                        </View>

                        <View style={styles.thanksSection}>
                            <Text style={styles.thanksTitle}>Gracias por preferirnos</Text>
                            <Text style={styles.thanksCopy}>KinalEats - Documento generado electronicamente.</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleSendEmail} activeOpacity={0.9} disabled={sending}>
                        <Ionicons name="mail-outline" size={18} color={COLORS.surface} />
                        <Text style={styles.primaryButtonText}>{sending ? "Enviando factura..." : "Enviar factura por correo"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const InfoRow = ({ label, value, strong }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, strong && styles.infoValueStrong]} numberOfLines={2}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.primaryDark,
    },
    safeAreaLight: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 34,
    },
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 24,
    },
    stateText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "700",
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
        textAlign: "center",
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
        backgroundColor: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
    },
    heroSend: {
        minHeight: 42,
        borderRadius: 14,
        backgroundColor: COLORS.ink,
        paddingHorizontal: 13,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
    },
    heroSendText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: "900",
    },
    heroKicker: {
        color: COLORS.primary,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.4,
    },
    heroTitle: {
        color: COLORS.surface,
        fontSize: 27,
        fontWeight: "900",
    },
    heroDate: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "700",
        marginTop: 2,
    },
    body: {
        padding: 16,
        gap: 16,
        marginTop: -18,
    },
    ticket: {
        backgroundColor: COLORS.surface,
        borderRadius: 4,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: COLORS.border,
        overflow: "hidden",
        shadowColor: COLORS.ink,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
    },
    ticketHeader: {
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 28,
        backgroundColor: COLORS.surfaceMuted,
        borderBottomWidth: 2,
        borderStyle: "dashed",
        borderColor: COLORS.border,
    },
    ticketLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    ticketTitle: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
        letterSpacing: 4,
    },
    ticketSubtitle: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginTop: 4,
    },
    ticketSectionCentered: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 22,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    restaurantName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "900",
        textTransform: "uppercase",
        textAlign: "center",
    },
    restaurantLocation: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 7,
    },
    invoiceCode: {
        color: COLORS.textLight,
        fontSize: 9,
        fontWeight: "900",
        marginTop: 12,
        textTransform: "uppercase",
    },
    infoSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.surfaceMuted,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        gap: 9,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 14,
    },
    infoLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    infoValue: {
        flex: 1,
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "800",
        textAlign: "right",
    },
    infoValueStrong: {
        color: COLORS.accent,
        fontWeight: "900",
    },
    clientSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        gap: 12,
    },
    sectionLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.2,
    },
    clientRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    clientCopy: {
        flex: 1,
    },
    clientName: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    clientEmail: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    clientPhone: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "800",
    },
    itemsSection: {
        paddingHorizontal: 20,
        paddingVertical: 22,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        gap: 16,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.2,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    itemCopy: {
        flex: 1,
    },
    itemName: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
        lineHeight: 17,
    },
    itemQty: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "800",
        marginTop: 3,
    },
    itemTotal: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "900",
    },
    noItemsBox: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
    },
    noItemsText: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    totalsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 9,
    },
    totalFinal: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 28,
        borderTopWidth: 2,
        borderBottomWidth: 1,
        borderStyle: "dashed",
        borderColor: COLORS.border,
    },
    totalFinalLabel: {
        color: COLORS.text,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1.8,
    },
    totalFinalValue: {
        color: COLORS.accent,
        fontSize: 36,
        fontWeight: "900",
        marginTop: 6,
    },
    thanksSection: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 7,
    },
    thanksTitle: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 2,
        textAlign: "center",
    },
    thanksCopy: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 16,
    },
    primaryButton: {
        minHeight: 52,
        borderRadius: 16,
        backgroundColor: COLORS.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        color: COLORS.surface,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0.5,
    },
});

export default InvoiceDetailScreen;
