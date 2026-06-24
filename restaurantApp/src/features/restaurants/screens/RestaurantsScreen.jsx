import { useEffect, useMemo, useState } from "react";
import { FlatList, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { useRestaurantStore } from "../store/useRestaurantStore";
import RestaurantCard from "../components/RestaurantCard";
import TopMenu from "../components/TopMenu";

const RestaurantsScreen = ({ navigation }) => {
    const { restaurants, loading, refreshing: storeRefreshing, error, page, limit, total, totalPages, fetchRestaurants, refreshRestaurants, setPage } = useRestaurantStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("all");
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    useEffect(() => {
        fetchRestaurants({ page, limit }).catch(() => null);
    }, [fetchRestaurants, page, limit]);

    const filteredRestaurants = useMemo(() => {
        const query = search.trim().toLowerCase();
        let result = restaurants;

        if (filter === "open") {
            result = result.filter((restaurant) => restaurant?.isActive !== false);
        } else if (filter === "featured") {
            result = result.filter((restaurant) => restaurant?.rating || restaurant?.calificacion);
        }

        if (!query) return result;

        return result.filter((restaurant) => {
            const name = String(restaurant?.nombre || restaurant?.name || "").toLowerCase();
            const city = String(restaurant?.direccion?.ciudad || restaurant?.city || "").toLowerCase();
            const description = String(restaurant?.descripcion || restaurant?.description || "").toLowerCase();
            return name.includes(query) || city.includes(query) || description.includes(query);
        });
    }, [restaurants, search, filter]);

    const stats = useMemo(() => {
        const total = restaurants.length;
        const active = restaurants.filter((restaurant) => restaurant?.isActive !== false).length;
        return { total, active };
    }, [restaurants]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshRestaurants({ page, limit });
        } finally {
            setRefreshing(false);
        }
    };

    const visibleLoading = loading && restaurants.length === 0;
    const isRefreshing = refreshing || storeRefreshing;

    const goToPage = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        setPage(nextPage);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screen}>
                <TopMenu
                    open={menuOpen}
                    onToggle={() => setMenuOpen((value) => !value)}
                    onItemPress={(label) => {
                        setMenuOpen(false);
                        if (label === "Perfil") {
                            navigation.navigate("Profile");
                        }
                    }}
                />

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <ImageBackground
                        source={{ uri: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80" }}
                        style={styles.hero}
                        imageStyle={styles.heroImage}
                    >
                        <View style={styles.heroOverlay} />
                        <View style={styles.heroContent}>
                            <Text style={styles.kicker}>Explora tu ciudad</Text>
                            <Text style={styles.heroTitle} numberOfLines={2}>Todos los restaurantes en un solo lugar</Text>
                            <Text style={styles.heroSubtitle} numberOfLines={3}>
                                Busca restaurantes, revisa su información y prepárate para elegir tu siguiente pedido.
                            </Text>

                            <View style={styles.searchBox}>
                                <Ionicons name="search-outline" size={18} color="#94a3b8" />
                                <TextInput
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Buscar restaurante o ciudad"
                                    placeholderTextColor="#94a3b8"
                                    style={styles.searchInput}
                                />
                            </View>

                            <View style={styles.filterRow}>
                                <FilterChip label="Todos" active={filter === "all"} onPress={() => setFilter("all")} />
                                <FilterChip label="Abiertos" active={filter === "open"} onPress={() => setFilter("open")} />
                                <FilterChip label="Destacados" active={filter === "featured"} onPress={() => setFilter("featured")} />
                            </View>

                            <View style={styles.statsRow}>
                                <StatCard label="Restaurantes" value={stats.total} />
                                <StatCard label="Activos" value={stats.active} />
                            </View>
                        </View>
                    </ImageBackground>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionKicker}>Listado general</Text>
                            <Text style={styles.sectionTitle} numberOfLines={2}>Restaurantes disponibles</Text>
                        </View>
                        <View style={styles.sectionChip}>
                            <Text style={styles.sectionChipText}>{filteredRestaurants.length} resultados</Text>
                        </View>
                    </View>

                    <View style={{ gap: 16 }}>
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((item, index) => (
                                <RestaurantCard
                                    key={String(item?._id || item?.id || index)}
                                    restaurant={item}
                                    onPress={() => setSelectedRestaurant(item)}
                                />
                            ))
                        ) : (
                            !visibleLoading && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="restaurant-outline" size={28} color={COLORS.primary} />
                                    <Text style={styles.emptyTitle}>No hay restaurantes para mostrar</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Revisa la conexión con el servicio o limpia el filtro de búsqueda.
                                    </Text>
                                </View>
                            )
                        )}
                    </View>

                    <View style={styles.paginationBar}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            style={[styles.paginationButton, page <= 1 && styles.paginationButtonDisabled]}
                        >
                            <Ionicons name="chevron-back" size={16} color={page <= 1 ? COLORS.textLight : COLORS.primary} />
                            <Text style={[styles.paginationText, page <= 1 && styles.paginationTextDisabled]}>Anterior</Text>
                        </TouchableOpacity>

                        <View style={styles.paginationInfo}>
                            <Text style={styles.paginationInfoText}>Página {page} de {totalPages}</Text>
                            <Text style={styles.paginationInfoSubtext}>{total} restaurantes en total</Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => goToPage(page + 1)}
                            disabled={page >= totalPages}
                            style={[styles.paginationButton, page >= totalPages && styles.paginationButtonDisabled]}
                        >
                            <Text style={[styles.paginationText, page >= totalPages && styles.paginationTextDisabled]}>Siguiente</Text>
                            <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? COLORS.textLight : COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Ficha Técnica Modal */}
            <Modal
                transparent
                visible={selectedRestaurant !== null}
                animationType="slide"
                onRequestClose={() => setSelectedRestaurant(null)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setSelectedRestaurant(null)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderTitle}>Ficha de Restaurante</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setSelectedRestaurant(null)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={20} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedRestaurant && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                                <Text style={styles.modalRestName}>
                                    {selectedRestaurant.nombre || selectedRestaurant.name}
                                </Text>
                                <Text style={styles.modalRestCuisine}>
                                    {selectedRestaurant.categoria || selectedRestaurant.category || "General"}
                                </Text>

                                <View style={styles.modalSection}>
                                    <View style={styles.modalSectionHeader}>
                                        <View style={[styles.modalIconBox, { backgroundColor: "#fff7ed" }]}>
                                            <Ionicons name="time" size={16} color={COLORS.accent} />
                                        </View>
                                        <Text style={styles.modalSectionLabel}>VENTANA OPERATIVA</Text>
                                    </View>
                                    <View style={styles.modalSectionCardOrange}>
                                        <Text style={styles.modalHours}>
                                            {selectedRestaurant.horario?.apertura || "08:00"} — {selectedRestaurant.horario?.cierre || "22:00"}
                                        </Text>
                                        {selectedRestaurant.horario?.diasAbierto && selectedRestaurant.horario.diasAbierto.length > 0 ? (
                                            <View style={styles.modalDaysRow}>
                                                {selectedRestaurant.horario.diasAbierto.map((day, idx) => (
                                                    <View key={idx} style={styles.modalDayBadge}>
                                                        <Text style={styles.modalDayBadgeText}>{day.toUpperCase()}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text style={styles.modalNoDays}>Todos los días</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.modalSection}>
                                    <View style={styles.modalSectionHeader}>
                                        <View style={[styles.modalIconBox, { backgroundColor: "#eff6ff" }]}>
                                            <Ionicons name="location" size={16} color="#2563eb" />
                                        </View>
                                        <Text style={styles.modalSectionLabel}>COORDENADAS DE SABOR</Text>
                                    </View>
                                    <View style={styles.modalSectionCardBlue}>
                                        <Text style={styles.modalAddressLabel}>CALLE / AVENIDA</Text>
                                        <Text style={styles.modalAddressText}>
                                            {selectedRestaurant.direccion?.calle || "Dirección no especificada"}
                                        </Text>
                                        <View style={styles.modalCardDivider} />
                                        <Text style={styles.modalAddressLabel}>CIUDAD / REGIÓN</Text>
                                        <Text style={styles.modalAddressText}>
                                            {selectedRestaurant.direccion?.ciudad || "Ciudad no especificada"}
                                        </Text>
                                    </View>
                                </View>

                                {selectedRestaurant.telefono && (
                                    <View style={styles.modalSection}>
                                        <View style={styles.modalSectionHeader}>
                                            <View style={[styles.modalIconBox, { backgroundColor: "#f0fdf4" }]}>
                                                <Ionicons name="call" size={16} color="#16a34a" />
                                            </View>
                                            <Text style={styles.modalSectionLabel}>CONTACTO</Text>
                                        </View>
                                        <View style={styles.modalSectionCardGreen}>
                                            <Text style={styles.modalAddressLabel}>TELÉFONO DE CONTACTO</Text>
                                            <Text style={styles.modalAddressText}>{selectedRestaurant.telefono}</Text>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.modalFooterButton}
                                    onPress={() => setSelectedRestaurant(null)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.modalFooterButtonText}>CERRAR EXPEDIENTE</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const StatCard = ({ label, value }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.filterChip, active && styles.filterChipActive]}>
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        paddingHorizontal: 14,
        paddingBottom: 36,
        paddingTop: 86,
        gap: 14,
    },
    hero: {
        minHeight: 300,
        borderRadius: 28,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    heroImage: {
        borderRadius: 28,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(2, 6, 23, 0.64)",
    },
    heroContent: {
        padding: 18,
        gap: 10,
    },
    kicker: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    heroTitle: {
        color: "#fff",
        fontSize: 28,
        lineHeight: 31,
        fontWeight: "900",
        maxWidth: "100%",
    },
    heroSubtitle: {
        color: "rgba(255,255,255,0.84)",
        fontSize: 13,
        lineHeight: 20,
        maxWidth: "100%",
    },
    searchBox: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.97)",
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 50,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    filterChip: {
        backgroundColor: "rgba(2, 6, 23, 0.18)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    filterChipActive: {
        backgroundColor: "#fff",
    },
    filterChipText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "800",
    },
    filterChipTextActive: {
        color: COLORS.accent,
    },
    statsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 2,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    statValue: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "900",
    },
    statLabel: {
        color: "rgba(255,255,255,0.76)",
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
    },
    errorText: {
        color: "#991b1b",
        backgroundColor: "#fff1f2",
        borderRadius: 14,
        padding: 12,
        fontWeight: "600",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 2,
    },
    sectionKicker: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 21,
        fontWeight: "900",
        marginTop: 4,
        flexShrink: 1,
    },
    sectionChip: {
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexShrink: 0,
    },
    sectionChipText: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: "800",
    },
    emptyState: {
        backgroundColor: COLORS.surface,
        borderRadius: 22,
        paddingVertical: 28,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#fed7aa",
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "800",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textLight,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        maxWidth: "100%",
    },
    paginationBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 4,
    },
    paginationButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexShrink: 0,
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    paginationText: {
        color: COLORS.primaryDark,
        fontSize: 12,
        fontWeight: "800",
    },
    paginationTextDisabled: {
        color: COLORS.textLight,
    },
    paginationInfo: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    paginationInfoText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "800",
        textAlign: "center",
    },
    paginationInfoSubtext: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === "ios" ? 44 : 32,
        maxHeight: "85%",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -8 },
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalHeaderTitle: {
        fontSize: 22,
        fontWeight: "900",
        fontStyle: "italic",
        color: COLORS.text,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalBody: {
        paddingBottom: 24,
    },
    modalRestName: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.text,
    },
    modalRestCuisine: {
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.accent,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginTop: 2,
        marginBottom: 16,
    },
    modalSection: {
        marginBottom: 18,
        width: "100%",
    },
    modalSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    modalIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    modalSectionLabel: {
        fontSize: 10,
        fontWeight: "900",
        color: COLORS.textLight,
        letterSpacing: 2,
    },
    modalSectionCardOrange: {
        backgroundColor: "#fff7ed",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ffedd5",
    },
    modalSectionCardBlue: {
        backgroundColor: "#eff6ff",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#dbeafe",
    },
    modalSectionCardGreen: {
        backgroundColor: "#f0fdf4",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#dcfce7",
    },
    modalHours: {
        fontSize: 20,
        fontWeight: "900",
        color: COLORS.text,
    },
    modalDaysRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 10,
    },
    modalDayBadge: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ffedd5",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    modalDayBadgeText: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: "800",
    },
    modalNoDays: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        marginTop: 4,
    },
    modalAddressLabel: {
        fontSize: 9,
        fontWeight: "900",
        color: "#2563eb",
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    modalAddressText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
    },
    modalCardDivider: {
        height: 1,
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        marginVertical: 10,
    },
    modalFooterButton: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: 16,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        width: "100%",
    },
    modalFooterButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
});

export default RestaurantsScreen;