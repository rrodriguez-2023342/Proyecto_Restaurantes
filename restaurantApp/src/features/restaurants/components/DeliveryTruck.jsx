import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../../shared/constants/theme";

const DASH_GAP = 30;
const DASH_COUNT = 14;

// Camion de reparto animado con barra de progreso.
// `progress` es 0..100 (cuanto avanza el pedido en el seguimiento).
const DeliveryTruck = ({ progress = 0 }) => {
    const bob = useRef(new Animated.Value(0)).current;
    const road = useRef(new Animated.Value(0)).current;
    const spin = useRef(new Animated.Value(0)).current;
    const fill = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const bobLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(bob, { toValue: 1, duration: 360, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
                Animated.timing(bob, { toValue: 0, duration: 360, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            ])
        );
        const roadLoop = Animated.loop(
            Animated.timing(road, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true })
        );
        const spinLoop = Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 850, easing: Easing.linear, useNativeDriver: true })
        );

        bobLoop.start();
        roadLoop.start();
        spinLoop.start();

        return () => {
            bobLoop.stop();
            roadLoop.stop();
            spinLoop.stop();
        };
    }, [bob, road, spin]);

    useEffect(() => {
        const clamped = Math.max(0, Math.min(100, progress));
        Animated.timing(fill, {
            toValue: clamped,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progress, fill]);

    const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
    const roadX = road.interpolate({ inputRange: [0, 1], outputRange: [0, -DASH_GAP] });
    const wheelRotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    const fillWidth = fill.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

    return (
        <View style={styles.wrapper}>
            <View style={styles.scene}>
                {/* Camion */}
                <Animated.View style={[styles.truck, { transform: [{ translateY }] }]}>
                    {/* Caja de carga */}
                    <View style={styles.cargo}>
                        <View style={styles.cargoLine} />
                        <View style={styles.cargoLine} />
                    </View>
                    {/* Cabina */}
                    <View style={styles.cab}>
                        <View style={styles.window} />
                    </View>
                </Animated.View>

                {/* Ruedas (giran) */}
                <Animated.View style={[styles.wheels, { transform: [{ translateY }] }]}>
                    <Wheel rotate={wheelRotate} />
                    <Wheel rotate={wheelRotate} />
                </Animated.View>

                {/* Carretera con lineas que se desplazan */}
                <View style={styles.road}>
                    <Animated.View style={[styles.dashRow, { transform: [{ translateX: roadX }] }]}>
                        {Array.from({ length: DASH_COUNT }).map((_, i) => (
                            <View key={i} style={styles.dash} />
                        ))}
                    </Animated.View>
                </View>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: fillWidth }]} />
            </View>
            <Text style={styles.progressLabel}>{Math.round(Math.max(0, Math.min(100, progress)))}% en camino</Text>
        </View>
    );
};

const Wheel = ({ rotate }) => (
    <View style={styles.wheel}>
        <Animated.View style={[styles.wheelSpokes, { transform: [{ rotate }] }]}>
            <View style={styles.spokeH} />
            <View style={styles.spokeV} />
        </Animated.View>
        <View style={styles.wheelHub} />
    </View>
);

const TRUCK_WIDTH = 150;

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        alignItems: "center",
        paddingVertical: 8,
        gap: 12,
    },
    scene: {
        width: 220,
        height: 96,
        justifyContent: "flex-end",
        alignItems: "center",
        overflow: "hidden",
    },
    truck: {
        width: TRUCK_WIDTH,
        height: 56,
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 12,
    },
    cargo: {
        width: 86,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#f1f5f9",
        borderWidth: 2,
        borderColor: "#1e293b",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 10,
    },
    cargoLine: {
        height: 3,
        borderRadius: 2,
        backgroundColor: "#cbd5e1",
    },
    cab: {
        width: 56,
        height: 50,
        marginLeft: -2,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: "#1e293b",
        overflow: "hidden",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: 6,
        paddingRight: 6,
    },
    window: {
        width: 26,
        height: 18,
        borderRadius: 5,
        backgroundColor: "#fde68a",
        borderWidth: 2,
        borderColor: "#1e293b",
    },
    wheels: {
        position: "absolute",
        bottom: 6,
        width: TRUCK_WIDTH,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 14,
    },
    wheel: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#1e293b",
        alignItems: "center",
        justifyContent: "center",
    },
    wheelSpokes: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    spokeH: {
        position: "absolute",
        width: 16,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#64748b",
    },
    spokeV: {
        position: "absolute",
        width: 3,
        height: 16,
        borderRadius: 2,
        backgroundColor: "#64748b",
    },
    wheelHub: {
        position: "absolute",
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#e2e8f0",
    },
    road: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 4,
        borderRadius: 3,
        backgroundColor: "#e2e8f0",
        overflow: "hidden",
        justifyContent: "center",
    },
    dashRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: DASH_GAP - 16,
        width: DASH_COUNT * DASH_GAP,
    },
    dash: {
        width: 16,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#cbd5e1",
    },
    progressTrack: {
        width: "100%",
        height: 8,
        borderRadius: 999,
        backgroundColor: COLORS.border,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: COLORS.primary,
    },
    progressLabel: {
        color: COLORS.accent,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
});

export default DeliveryTruck;
