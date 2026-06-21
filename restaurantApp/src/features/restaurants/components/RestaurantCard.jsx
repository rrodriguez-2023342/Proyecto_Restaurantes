import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";

const RestaurantCard = ({ restaurant, onPress }) => {
    const name = restaurant?.nombre || restaurant?.name || "Restaurante";
    const description = restaurant?.descripcion || restaurant?.description || "Disponible para pedidos y reservas.";
    const location = restaurant?.direccion?.ciudad || restaurant?.city || "Ubicación no disponible";
    const rating = restaurant?.rating || restaurant?.calificacion || "4.8";
    const image = restaurant?.fotos || restaurant?.photo || restaurant?.image;
    const isOpen = restaurant?.isActive !== false;
    const cuisine = restaurant?.tipo || restaurant?.category || restaurant?.cocina || "Comida variada";

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.imageWrapper}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.imageFallback}>
                        <Ionicons name="restaurant-outline" size={34} color="#fff" />
                    </View>
                )}
                <View style={styles.badge}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.badgeText}>{rating}</Text>
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.topRow}>
                    <View style={[styles.statusPill, isOpen ? styles.statusOpen : styles.statusClosed]}>
                        <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
                            {isOpen ? "Abierto" : "Cerrado"}
                        </Text>
                    </View>
                    <View style={styles.typePill}>
                        <Text style={styles.typeText}>{cuisine}</Text>
                    </View>
                </View>

                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color="#9f1239" />
                        <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
                    </View>
                    <View style={styles.metaPill}>
                        <Text style={styles.metaPillText}>Ver restaurantes</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    imageWrapper: {
        height: 152,
        backgroundColor: COLORS.primaryDark,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
    },
    badge: {
        position: "absolute",
        right: 12,
        top: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(2, 6, 23, 0.88)",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
    body: {
        padding: 14,
        gap: 8,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    statusPill: {
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    statusOpen: {
        backgroundColor: "#ecfdf5",
    },
    statusClosed: {
        backgroundColor: "#fef2f2",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },
    statusTextOpen: {
        color: "#166534",
    },
    statusTextClosed: {
        color: "#991b1b",
    },
    typePill: {
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        maxWidth: 150,
    },
    typeText: {
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: "800",
    },
    name: {
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "800",
        lineHeight: 22,
    },
    description: {
        color: COLORS.textLight,
        fontSize: 12,
        lineHeight: 17,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
    },
    metaItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        flex: 1,
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: "700",
    },
    metaPill: {
        backgroundColor: COLORS.accentSoft,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    metaPillText: {
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: "800",
    },
});

export default RestaurantCard;