import { useEffect, useMemo, useState } from "react";
import { FlatList, ImageBackground, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRestaurantStore } from "../store/useRestaurantStore";
import RestaurantCard from "../components/RestaurantCard";
import TopMenu from "../components/TopMenu";

const RestaurantsScreen = () => {
    const { restaurants, loading, refreshing: storeRefreshing, error, fetchRestaurants, refreshRestaurants } = useRestaurantStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchRestaurants().catch(() => null);
    }, [fetchRestaurants]);

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
            await refreshRestaurants();
        } finally {
            setRefreshing(false);
        }
    };

    const visibleLoading = loading && restaurants.length === 0;
    const isRefreshing = refreshing || storeRefreshing;

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
                            <Text style={styles.heroTitle}>Todos los restaurantes en un solo lugar</Text>
                            <Text style={styles.heroSubtitle}>
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
                            <Text style={styles.sectionTitle}>Restaurantes disponibles</Text>
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
        backgroundColor: "#f8fafc",
    },
    screen: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    content: {
        paddingHorizontal: 18,
        paddingBottom: 36,
        paddingTop: 92,
        gap: 18,
    },
    hero: {
        minHeight: 320,
        borderRadius: 30,
        overflow: "hidden",
        justifyContent: "flex-end",
    },
    heroImage: {
        borderRadius: 30,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(15, 23, 42, 0.62)",
    },
    heroContent: {
        padding: 20,
        gap: 12,
    },
    kicker: {
        color: "#fda4af",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.4,
        textTransform: "uppercase",
    },
    heroTitle: {
        color: "#fff",
        fontSize: 30,
        lineHeight: 34,
        fontWeight: "900",
        maxWidth: 290,
    },
    heroSubtitle: {
        color: "rgba(255,255,255,0.84)",
        fontSize: 14,
        lineHeight: 20,
        maxWidth: 320,
    },
    searchBox: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 18,
        paddingHorizontal: 14,
        height: 54,
    },
    searchInput: {
        flex: 1,
        color: "#0f172a",
        fontSize: 14,
        fontWeight: "600",
    },
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 2,
    },
    filterChip: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
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
        color: "#9f1239",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 2,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    statValue: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "900",
    },
    statLabel: {
        color: "rgba(255,255,255,0.76)",
        fontSize: 12,
        fontWeight: "700",
        marginTop: 4,
    },
    errorText: {
        color: "#b91c1c",
        backgroundColor: "#fef2f2",
        borderRadius: 16,
        padding: 14,
        fontWeight: "600",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 2,
    },
    sectionKicker: {
        color: "#9f1239",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    sectionTitle: {
        color: "#0f172a",
        fontSize: 22,
        fontWeight: "900",
        marginTop: 4,
    },
    sectionChip: {
        backgroundColor: "#fff1f2",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    sectionChipText: {
        color: "#9f1239",
        fontSize: 12,
        fontWeight: "800",
    },
    emptyState: {
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingVertical: 30,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#fecdd3",
    },
    emptyTitle: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: "800",
        textAlign: "center",
    },
    emptySubtitle: {
        color: "#64748b",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
    },
});

export default RestaurantsScreen;