import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const items = [
    { label: "Restaurantes", icon: "storefront-outline" },
    { label: "Favoritos", icon: "heart-outline" },
    { label: "Pedidos", icon: "receipt-outline" },
    { label: "Perfil", icon: "person-outline" },
    { label: "Ayuda", icon: "help-circle-outline" },
];

const TopMenu = ({ open, onToggle, onItemPress }) => {
    return (
        <View pointerEvents="box-none" style={styles.wrapper}>
            <TouchableOpacity style={styles.toggle} onPress={onToggle} activeOpacity={0.85}>
                <Ionicons name={open ? "close" : "menu"} size={22} color="#fff" />
            </TouchableOpacity>

            {open ? <Pressable style={styles.backdrop} onPress={onToggle} /> : null}

            <View style={[styles.drawer, open && styles.drawerOpen]}>
                <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                        <Ionicons name="restaurant" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>Restaurant App</Text>
                        <Text style={styles.brandSubtitle}>Menu principal</Text>
                    </View>
                </View>

                <View style={styles.menuList}>
                    {items.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.menuItem, index === 0 && styles.menuItemActive]}
                            activeOpacity={0.8}
                            onPress={() => onItemPress?.(item.label)}
                        >
                            <Ionicons name={item.icon} size={18} color="#fff" />
                            <Text style={styles.menuText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 18,
        left: 16,
        zIndex: 50,
    },
    toggle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#be123c",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(15, 23, 42, 0.28)",
        zIndex: -1,
    },
    drawer: {
        marginTop: 14,
        width: 272,
        minHeight: 520,
        borderRadius: 28,
        backgroundColor: "#b40b2f",
        padding: 18,
        gap: 20,
        transform: [{ translateX: -320 }],
        opacity: 0,
    },
    drawerOpen: {
        transform: [{ translateX: 0 }],
        opacity: 1,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 32,
    },
    brandMark: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    brandTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
    },
    brandSubtitle: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 12,
        marginTop: 2,
    },
    menuList: {
        gap: 10,
        marginTop: 14,
    },
    menuItem: {
        minHeight: 52,
        borderRadius: 18,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    menuItemActive: {
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },
    menuText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});

export default TopMenu;