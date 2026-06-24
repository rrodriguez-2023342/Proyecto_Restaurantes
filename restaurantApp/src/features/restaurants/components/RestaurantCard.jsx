import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme.js";

const RestaurantCard = ({ restaurant, onPress }) => {
    const name = restaurant?.nombre || restaurant?.name || "Restaurante";
    const description = restaurant?.descripcion || restaurant?.description || "Disponible para pedidos y reservas.";
    const location = restaurant?.direccion?.ciudad || restaurant?.city || "Ubicación no disponible";
    const rating = restaurant?.rating || restaurant?.calificacion || "4.8";
    const image = restaurant?.fotos || restaurant?.photo || restaurant?.image;
    const isOpen = restaurant?.isActive !== false;
    const cuisine = restaurant?.categoria || restaurant?.category || restaurant?.cocina || "General";
    
    const openingTime = restaurant?.horario?.apertura || "08:00";
    const closingTime = restaurant?.horario?.cierre || "22:00";

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
            {/* Image Wrapper */}
            <View style={styles.imageWrapper}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.imageFallback}>
                        <Ionicons name="restaurant-outline" size={38} color="#fff" />
                    </View>
                )}

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.ratingText}>{rating}</Text>
                </View>

                {/* Status Badge */}
                <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                    <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
                    <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
                        {isOpen ? "Operativo" : "En Pausa"}
                    </Text>
                </View>
            </View>

            {/* Content Body */}
            <View style={styles.body}>
                {/* Category & Cuisine */}
                <View style={styles.cuisineRow}>
                    <Ionicons name="fast-food-outline" size={12} color={COLORS.accent} />
                    <Text style={styles.cuisineText}>{cuisine.toUpperCase()}</Text>
                </View>

                {/* Restaurant Name */}
                <Text style={styles.name} numberOfLines={1}>{name}</Text>

                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Meta details */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.secondary} />
                        <Text style={styles.metaText} numberOfLines={1}>{location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.secondary} />
                        <Text style={styles.metaText}>{`${openingTime} - ${closingTime}`}</Text>
                    </View>
                </View>

                {/* Action button */}
                <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
                    <Ionicons name="eye-outline" size={15} color="#fff" />
                    <Text style={styles.actionButtonText}>FICHA TÉCNICA</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
        marginVertical: 4,
    },
    imageWrapper: {
        height: 160,
        backgroundColor: COLORS.primaryDark,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
    },
    ratingBadge: {
        position: "absolute",
        right: 12,
        top: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
    },
    ratingText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "800",
    },
    statusBadge: {
        position: "absolute",
        left: 12,
        top: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
    },
    statusOpen: {
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        borderColor: "rgba(22, 163, 74, 0.2)",
    },
    statusClosed: {
        backgroundColor: "rgba(225, 29, 72, 0.1)",
        borderColor: "rgba(225, 29, 72, 0.2)",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dotOpen: {
        backgroundColor: "#16a34a",
    },
    dotClosed: {
        backgroundColor: "#e11d48",
    },
    statusText: {
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    textOpen: {
        color: "#16a34a",
    },
    textClosed: {
        color: "#e11d48",
    },
    body: {
        padding: 18,
        gap: 8,
    },
    cuisineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    cuisineText: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2,
    },
    name: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
        lineHeight: 24,
        marginTop: 2,
    },
    description: {
        color: COLORS.textLight,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 6,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    metaText: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: "600",
        flexShrink: 1,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 8,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
});

export default RestaurantCard;