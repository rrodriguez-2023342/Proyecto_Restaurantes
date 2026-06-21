import { useEffect, useMemo, useState } from "react";
import { FlatList, ImageBackground, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { useRestaurantStore } from "../store/useRestaurantStore";
import RestaurantCard from "../components/RestaurantCard";
import TopMenu from "../components/TopMenu";

const RestaurantsScreen = () => {
    const { restaurants, loading, refreshing: storeRefreshing, error, page, limit, total, totalPages, fetchRestaurants, refreshRestaurants, setPage } = useRestaurantStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("all");

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
                    onItemPress={() => setMenuOpen(false)}
                />

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#be123c" />
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

                    <FlatList
                        data={filteredRestaurants}
                        keyExtractor={(item, index) => String(item?._id || item?.id || index)}
                        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                        ListEmptyComponent={
                            visibleLoading ? null : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="restaurant-outline" size={28} color="#be123c" />
                                    <Text style={styles.emptyTitle}>No hay restaurantes para mostrar</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Revisa la conexión con el servicio o limpia el filtro de búsqueda.
                                    </Text>
                                </View>
                            )
                        }
                    />

                    <View style={styles.paginationBar}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            style={[styles.paginationButton, page <= 1 && styles.paginationButtonDisabled]}
                        >
                            <Ionicons name="chevron-back" size={16} color={page <= 1 ? COLORS.textLight : COLORS.primaryDark} />
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
                            <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? COLORS.textLight : COLORS.primaryDark} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
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
});

export default RestaurantsScreen;