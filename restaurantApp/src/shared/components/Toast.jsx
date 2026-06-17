import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";

const ToastContext = createContext(null);

const TOAST_CONFIG = {
    success: {
        icon: "check-circle",
        accent: "#16a34a",
        background: "#f0fdf4",
        border: "#bbf7d0",
        title: "Listo",
    },
    error: {
        icon: "alert-circle",
        accent: "#dc2626",
        background: "#fff7f7",
        border: "#fecaca",
        title: "Error",
    },
    info: {
        icon: "info",
        accent: "#c94606",
        background: "#fffbeb",
        border: "#fed7aa",
        title: "Aviso",
    },
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const { width } = useWindowDimensions();
    const compact = width < 360;
    const translateY = useRef(new Animated.Value(-120)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    const hideToast = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -120,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
        ]).start(() => setToast(null));
    }, [opacity, translateY]);

    const showToast = useCallback(
        ({ type = "info", title, message, duration = 3800 }) => {
            const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            setToast({
                type,
                title: title || config.title,
                message,
            });

            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 85,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]).start();

            timerRef.current = setTimeout(hideToast, duration);
        },
        [hideToast, opacity, translateY]
    );

    const config = toast
        ? TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
        : TOAST_CONFIG.info;

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {toast && (
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.wrapper,
                        compact && styles.wrapperCompact,
                        {
                            opacity,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={0.92}
                        onPress={hideToast}
                        style={[
                            styles.toast,
                            {
                                backgroundColor: config.background,
                                borderColor: config.border,
                            },
                            compact && styles.toastCompact,
                        ]}
                    >
                        <View
                            style={[
                                styles.iconWrap,
                                { backgroundColor: config.accent },
                            ]}
                        >
                            <Feather name={config.icon} size={18} color="#ffffff" />
                        </View>
                        <View style={styles.copy}>
                            <Text
                                style={[
                                    styles.title,
                                    compact && styles.titleCompact,
                                    { color: config.accent },
                                ]}
                            >
                                {toast.title}
                            </Text>
                            {!!toast.message && (
                                <Text
                                    style={[
                                        styles.message,
                                        compact && styles.messageCompact,
                                    ]}
                                >
                                    {toast.message}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast debe usarse dentro de ToastProvider");
    }

    return context;
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        top: 46,
        left: 14,
        right: 14,
        zIndex: 999,
        elevation: 999,
    },
    wrapperCompact: {
        top: 36,
        left: 10,
        right: 10,
    },
    toast: {
        minHeight: 66,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#020617",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 10,
    },
    toastCompact: {
        minHeight: 58,
        gap: 10,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 0,
    },
    titleCompact: {
        fontSize: 12,
    },
    message: {
        color: "#334155",
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 18,
        marginTop: 2,
    },
    messageCompact: {
        fontSize: 12,
        lineHeight: 17,
    },
});
