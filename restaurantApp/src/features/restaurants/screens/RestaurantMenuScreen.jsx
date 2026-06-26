import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { getMenus } from "../../../shared/api/menu";
import { getPlatos } from "../../../shared/api/plato";
import { useCartStore } from "../store/useCartStore";
import { useToast } from "../../../shared/components/Toast";
import DishDetailModal from "../components/DishDetailModal";
import CartFab from "../components/CartFab";

const getList = (data, key) => data?.data || data?.[key] || data || [];

const buildCartItem = (dish, restaurantId, restaurantName) => ({
    id: dish._id || dish.id,
    name: dish.nombrePlato || dish.nombre || "Plato",
    price: Number(dish.precio || 0),
    image: dish.fotosPlato || dish.fotos || dish.image || null,
    restaurantId,
    restaurantName,
});

const RestaurantMenuScreen = ({ navigation, route }) => {
    const restaurant = route.params?.restaurant;
    const restaurantId = route.params?.restaurantId || restaurant?._id || restaurant?.id;
    const restaurantName = restaurant?.nombre || restaurant?.name || "Restaurante";
    const [menus, setMenus] = useState([]);
    const [platos, setPlatos] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPlatos, setLoadingPlatos] = useState(false);
    const [error, setError] = useState("");
    const [selectedDish, setSelectedDish] = useState(null);
    const [pendingItem, setPendingItem] = useState(null);

    const { showToast } = useToast();
    const cartItems = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const startNewCart = useCartStore((state) => state.startNewCart);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleAddToCart = (quantity, notas) => {
        if (!selectedDish) return false;
        const cartItem = { ...buildCartItem(selectedDish, restaurantId, restaurantName), quantity, notas };
        const result = addItem(cartItem);

        if (!result.ok && result.reason === "different-restaurant") {
            setPendingItem(cartItem);
            return false;
        }

        showToast({ type: "success", title: "Agregado al carrito", message: `${cartItem.name} x${quantity}` });
        return true;
    };

    const handleConfirmNewCart = () => {
        if (!pendingItem) return;
        startNewCart(pendingItem);
        const item = pendingItem;
        setPendingItem(null);
        showToast({ type: "success", title: "Carrito actualizado", message: `${item.name} x${item.quantity}` });
    };

    useEffect(() => {
        const loadMenus = async () => {
            if (!restaurantId) {
                setError("No se encontro el restaurante.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                const { data } = await getMenus({ restaurante: restaurantId });
                const loadedMenus = getList(data, "menus");
                setMenus(loadedMenus);

                if (loadedMenus.length > 0) {
                    const firstMenuId = loadedMenus[0]._id || loadedMenus[0].id;
                    setActiveMenuId(firstMenuId);
                    const { data: platosData } = await getPlatos(firstMenuId);
                    setPlatos(getList(platosData, "platos"));
                } else {
                    setPlatos([]);
                }
            } catch (err) {
                setError(err.response?.data?.message || "No se pudieron cargar los menus.");
            } finally {
                setLoading(false);
            }
        };

        loadMenus();
    }, [restaurantId]);

    const activeMenu = useMemo(
        () => menus.find((menu) => String(menu._id || menu.id) === String(activeMenuId)),
        [activeMenuId, menus]
    );

    const handleMenuChange = async (menuId) => {
        setActiveMenuId(menuId);
        setLoadingPlatos(true);
        setError("");
        try {
            const { data } = await getPlatos(menuId);
            setPlatos(getList(data, "platos"));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los platos.");
            setPlatos([]);
        } finally {
            setLoadingPlatos(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Carta del restaurante</Text>
                    <Text style={styles.title} numberOfLines={1}>{restaurantName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={() => navigation.navigate("RestaurantReservation", { restaurant, restaurantId })}
                    activeOpacity={0.85}
                >
                    <Ionicons name="calendar-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando menus...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {menus.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuTabs}>
                            {menus.map((menu) => {
                                const menuId = menu._id || menu.id;
                                const active = String(menuId) === String(activeMenuId);
                                return (
                                    <TouchableOpacity
                                        key={String(menuId)}
                                        style={[styles.menuTab, active && styles.menuTabActive]}
                                        onPress={() => handleMenuChange(menuId)}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={[styles.menuTabText, active && styles.menuTabTextActive]}>
                                            {menu.nombreMenu || menu.nombre || "Menu"}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="book-outline" size={32} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>No hay menus registrados</Text>
                            <Text style={styles.emptySubtitle}>Este restaurante aun no tiene carta disponible.</Text>
                        </View>
                    )}

                    {activeMenu ? (
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>{activeMenu.nombreMenu || activeMenu.nombre || "Menu"}</Text>
                            <Text style={styles.menuDescription}>
                                {activeMenu.descripcionMenu || activeMenu.descripcion || `${platos.length} platos disponibles`}
                            </Text>
                        </View>
                    ) : null}

                    {loadingPlatos ? (
                        <View style={styles.inlineLoading}>
                            <ActivityIndicator color={COLORS.primary} />
                        </View>
                    ) : platos.length > 0 ? (
                        <View style={styles.dishList}>
                            {platos.map((plato) => (
                                <DishCard
                                    key={String(plato._id || plato.id || plato.nombrePlato)}
                                    plato={plato}
                                    onPress={() => setSelectedDish(plato)}
                                />
                            ))}
                        </View>
                    ) : (
                        menus.length > 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="restaurant-outline" size={32} color={COLORS.primary} />
                                <Text style={styles.emptyTitle}>Sin platos por ahora</Text>
                                <Text style={styles.emptySubtitle}>Prueba con otro menu disponible.</Text>
                            </View>
                        )
                    )}
                </ScrollView>
            )}

            <CartFab count={cartCount} onPress={() => navigation.navigate("Cart")} />

            <DishDetailModal
                visible={selectedDish !== null}
                dish={selectedDish}
                onClose={() => setSelectedDish(null)}
                onAdd={handleAddToCart}
            />

            <Modal
                visible={pendingItem !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setPendingItem(null)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmCard}>
                        <View style={styles.confirmIcon}>
                            <Ionicons name="swap-horizontal" size={26} color={COLORS.accent} />
                        </View>
                        <Text style={styles.confirmTitle}>Cambiar de restaurante</Text>
                        <Text style={styles.confirmMessage}>
                            Tu carrito tiene platos de otro restaurante. Para agregar este plato, vaciaremos el
                            carrito actual y empezaremos uno nuevo.
                        </Text>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={styles.confirmCancel}
                                onPress={() => setPendingItem(null)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.confirmCancelText}>Conservar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmAccept}
                                onPress={handleConfirmNewCart}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.confirmAcceptText}>Vaciar y agregar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const DishCard = ({ plato, onPress }) => {
    const image = plato.fotosPlato || plato.fotos || plato.image;
    const name = plato.nombrePlato || plato.nombre || "Plato";
    const description = plato.descripcionPlato || plato.descripcion || "Preparacion especial de la casa.";
    const price = Number(plato.precio || 0);

    return (
        <TouchableOpacity style={styles.dishCard} onPress={onPress} activeOpacity={0.85}>
            {image ? (
                <Image source={{ uri: image }} style={styles.dishImage} />
            ) : (
                <View style={styles.dishFallback}>
                    <Ionicons name="fast-food-outline" size={28} color={COLORS.primary} />
                </View>
            )}
            <View style={styles.dishCopy}>
                <View style={styles.dishTopLine}>
                    <Text style={styles.dishName} numberOfLines={2}>{name}</Text>
                    <Text style={styles.dishPrice}>Q{price.toFixed(2)}</Text>
                </View>
                <Text style={styles.dishDescription} numberOfLines={3}>{description}</Text>
                {plato.tipoPlato ? <Text style={styles.dishType}>{String(plato.tipoPlato).split("_").join(" ")}</Text> : null}
                <View style={styles.dishAddRow}>
                    <Ionicons name="add-circle" size={18} color={COLORS.primary} />
                    <Text style={styles.dishAddText}>Agregar al pedido</Text>
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
        backgroundColor: COLORS.background,
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
    reserveButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 34,
        gap: 16,
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
    errorText: {
        color: "#991b1b",
        backgroundColor: "#fff1f2",
        borderRadius: 14,
        padding: 12,
        fontWeight: "700",
    },
    menuTabs: {
        gap: 8,
        paddingVertical: 2,
    },
    menuTab: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    menuTabActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    menuTabText: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    menuTabTextActive: {
        color: "#fff",
    },
    menuHeader: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: 20,
        padding: 18,
    },
    menuTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "900",
    },
    menuDescription: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 19,
        marginTop: 6,
    },
    inlineLoading: {
        padding: 24,
    },
    dishList: {
        gap: 12,
    },
    dishCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        flexDirection: "row",
        gap: 12,
    },
    dishImage: {
        width: 92,
        height: 92,
        borderRadius: 14,
        backgroundColor: COLORS.accentSoft,
    },
    dishFallback: {
        width: 92,
        height: 92,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.accentSoft,
    },
    dishCopy: {
        flex: 1,
        gap: 6,
    },
    dishTopLine: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
    },
    dishName: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "900",
        lineHeight: 20,
    },
    dishPrice: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: "900",
    },
    dishDescription: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 17,
    },
    dishType: {
        alignSelf: "flex-start",
        color: COLORS.primaryDark,
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
        fontSize: 9,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    dishAddRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 2,
    },
    dishAddText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "900",
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: "rgba(2, 6, 23, 0.6)",
        alignItems: "center",
        justifyContent: "center",
        padding: 28,
    },
    confirmCard: {
        width: "100%",
        maxWidth: 380,
        backgroundColor: "#fff",
        borderRadius: 26,
        padding: 24,
        alignItems: "center",
        gap: 12,
    },
    confirmIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.accentSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmTitle: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
        textAlign: "center",
    },
    confirmMessage: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
        textAlign: "center",
    },
    confirmActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
        width: "100%",
    },
    confirmCancel: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmCancelText: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "800",
    },
    confirmAccept: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmAcceptText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 26,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#fed7aa",
        backgroundColor: "#fff",
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "900",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
});

export default RestaurantMenuScreen;
