import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";

const CartFab = ({ count = 0, onPress }) => {
    if (!count) return null;

    return (
        <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.9}>
            <Ionicons name="cart" size={24} color="#fff" />
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        right: 18,
        bottom: 26,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOpacity: 0.4,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        paddingHorizontal: 6,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    badgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "900",
    },
});

export default CartFab;
