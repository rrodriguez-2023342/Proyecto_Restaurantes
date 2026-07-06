import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";

const items = [
    { label: "Restaurantes", icon: "storefront-outline" },
    { label: "Mis reservaciones", icon: "calendar-outline" },
    { label: "Facturas", icon: "document-text-outline" },
    { label: "Pedidos", icon: "receipt-outline" },
    { label: "Perfil", icon: "person-outline" },
    { label: "Ayuda", icon: "help-circle-outline" },
    { label: "Salir", icon: "log-out-outline" },
];

const TopMenu = ({ open, onToggle, onItemPress }) => {
    const { width, height } = useWindowDimensions();
    const drawerWidth = Math.min(256, Math.max(220, width - 24));
    const drawerMaxHeight = Math.max(320, height - 96);

    return (
        <View pointerEvents="box-none" style={[styles.wrapper, { width }]}>
            <TouchableOpacity style={styles.toggle} onPress={onToggle} activeOpacity={0.85}>
                <Ionicons name={open ? "close" : "menu"} size={22} color="#fff" />
            </TouchableOpacity>

            {open ? <Pressable style={styles.backdrop} onPress={onToggle} /> : null}

            <View style={[styles.drawer, { width: drawerWidth, maxHeight: drawerMaxHeight }, open && styles.drawerOpen]}>
                <View style={styles.brandRow}>
                    <View style={styles.brandMark}>
                        <Ionicons name="restaurant" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.brandTitle}>Restaurant App</Text>
                        <Text style={styles.brandSubtitle}>Menu principal</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.menuScroll}
                    contentContainerStyle={styles.menuList}
                    showsVerticalScrollIndicator={false}
                >
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
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 12,
        left: 12,
        bottom: 0,
        zIndex: 50,
    },
    toggle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    backdrop: {
        position: "absolute",
        top: -12,
        left: -12,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.28)",
        zIndex: -1,
    },
    drawer: {
        marginTop: 12,
        borderRadius: 26,
        backgroundColor: COLORS.primaryDark,
        padding: 16,
        gap: 16,
        transform: [{ translateX: -320 }],
        opacity: 0,
        overflow: "hidden",
    },
    drawerOpen: {
        transform: [{ translateX: 0 }],
        opacity: 1,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 28,
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
        fontSize: 15,
        fontWeight: "800",
    },
    brandSubtitle: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 11,
        marginTop: 2,
    },
    menuScroll: {
        flexGrow: 0,
    },
    menuList: {
        gap: 10,
        marginTop: 8,
        paddingBottom: 4,
    },
    menuItem: {
        minHeight: 50,
        borderRadius: 16,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    menuItemActive: {
        backgroundColor: "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },
    menuText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
        flexShrink: 1,
    },
});

export default TopMenu;
