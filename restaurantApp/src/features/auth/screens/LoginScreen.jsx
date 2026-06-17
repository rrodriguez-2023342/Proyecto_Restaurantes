import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { Controller, useForm } from "react-hook-form";
import { useToast } from "../../../shared/components/Toast";
import { useAuth } from "../hooks/useAuth";

import kinalEatsLogo from "../../../../assets/logo1.png";
import authBackgroundVideo from "../../../../assets/fondoAuthPage.mp4";

const LoginField = ({
    control,
    error,
    icon,
    label,
    name,
    navigation,
    placeholder,
    rules,
    secureTextEntry,
    ...inputProps
}) => (
    <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            {name === "password" && (
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.navigate("ForgotPassword")}
                >
                    <Text style={styles.forgotText}>Olvide mi contrasena</Text>
                </TouchableOpacity>
            )}
        </View>

        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <View style={[styles.inputShell, error && styles.inputShellError]}>
                    <Feather name={icon} size={21} color="#8aa0bd" />
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor="#94a3b8"
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        secureTextEntry={secureTextEntry}
                        {...inputProps}
                    />
                </View>
            )}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();
    const { showToast } = useToast();

    const backgroundPlayer = useVideoPlayer(authBackgroundVideo, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleLogin(data);
            showToast({
                type: "success",
                title: "Bienvenido de nuevo",
                message: "Inicio de sesion correcto.",
            });
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Correo, usuario o contrasena incorrectos.";

            showToast({
                type: "error",
                title: "No se pudo iniciar sesion",
                message,
            });
        }
    };

    const onInvalid = (formErrors) => {
        const firstError =
            formErrors.emailOrUsername?.message || formErrors.password?.message;

        showToast({
            type: "error",
            title: "Revisa tus datos",
            message: firstError || "Completa los campos requeridos.",
        });
    };

    return (
        <View style={styles.container}>
            <VideoView
                player={backgroundPlayer}
                style={StyleSheet.absoluteFill}
                nativeControls={false}
                contentFit="cover"
            />
            <View style={styles.backdrop} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.card}>
                        <View style={styles.logoWrap}>
                            <Image
                                source={kinalEatsLogo}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.title}>Bienvenido de nuevo</Text>
                        <Text style={styles.subtitle}>
                            Ingresa tus credenciales para continuar.
                        </Text>

                        <View style={styles.form}>
                            <LoginField
                                control={control}
                                error={errors.emailOrUsername?.message}
                                icon="mail"
                                label="EMAIL O USUARIO"
                                name="emailOrUsername"
                                placeholder="correo@restaurante.com"
                                rules={{ required: "Email o usuario requerido" }}
                                keyboardType="email-address"
                                textContentType="username"
                            />

                            <LoginField
                                control={control}
                                error={errors.password?.message}
                                icon="lock"
                                label="CONTRASENA"
                                name="password"
                                navigation={navigation}
                                placeholder="********"
                                rules={{ required: "Contrasena requerida" }}
                                secureTextEntry
                                textContentType="password"
                            />

                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.disabledButton]}
                                activeOpacity={0.86}
                                disabled={loading}
                                onPress={handleSubmit(onSubmit, onInvalid)}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        INICIAR SESION
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorDot}>o</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            activeOpacity={0.82}
                            onPress={() => navigation.navigate("Register")}
                        >
                            <Feather name="user-plus" size={16} color="#c94606" />
                            <Text style={styles.secondaryButtonText}>
                                CREAR UNA CUENTA
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.cardDivider} />

                        <View style={styles.metrics}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>2K+</Text>
                                <Text style={styles.metricLabel}>LOCALES</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>99%</Text>
                                <Text style={styles.metricLabel}>UPTIME</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricValue}>5*</Text>
                                <Text style={styles.metricLabel}>RATING</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0b1020",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(3, 7, 18, 0.36)",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
        backgroundColor: "#ffffff",
        borderRadius: 26,
        paddingHorizontal: 30,
        paddingTop: 36,
        paddingBottom: 30,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
        elevation: 12,
    },
    logoWrap: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        marginBottom: 26,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 6,
    },
    logo: {
        width: 64,
        height: 64,
    },
    title: {
        color: "#111b35",
        fontSize: 29,
        fontWeight: "800",
        lineHeight: 36,
        letterSpacing: 0,
    },
    subtitle: {
        color: "#6b7b96",
        fontSize: 18,
        fontWeight: "600",
        lineHeight: 25,
        marginTop: 6,
    },
    form: {
        marginTop: 34,
    },
    fieldGroup: {
        marginBottom: 18,
    },
    labelRow: {
        minHeight: 19,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    label: {
        color: "#697c9a",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 5,
    },
    forgotText: {
        color: "#c94606",
        fontSize: 14,
        fontWeight: "800",
    },
    inputShell: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#dbe4ef",
        borderRadius: 14,
        paddingHorizontal: 17,
    },
    inputShellError: {
        borderColor: "#ef4444",
    },
    input: {
        flex: 1,
        color: "#16213a",
        fontSize: 17,
        fontWeight: "700",
        paddingVertical: 0,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 7,
    },
    primaryButton: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        borderRadius: 13,
        marginTop: 1,
        shadowColor: "#020617",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.24,
        shadowRadius: 16,
        elevation: 7,
    },
    disabledButton: {
        opacity: 0.72,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 5,
    },
    separator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        marginVertical: 31,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e6edf5",
    },
    separatorDot: {
        color: "#9aadca",
        fontSize: 20,
        fontWeight: "900",
        lineHeight: 21,
    },
    secondaryButton: {
        height: 53,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#ffb25d",
        borderRadius: 14,
        backgroundColor: "#ffffff",
    },
    secondaryButtonText: {
        color: "#c94606",
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 4,
    },
    cardDivider: {
        height: 1,
        backgroundColor: "#eef3f8",
        marginTop: 48,
        marginBottom: 26,
    },
    metrics: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    metricItem: {
        width: "30%",
        alignItems: "center",
    },
    metricValue: {
        color: "#17213a",
        fontSize: 19,
        fontWeight: "900",
        lineHeight: 23,
    },
    metricLabel: {
        color: "#8ca0bf",
        fontSize: 11,
        fontWeight: "900",
        lineHeight: 16,
    },
});

export default LoginScreen;
