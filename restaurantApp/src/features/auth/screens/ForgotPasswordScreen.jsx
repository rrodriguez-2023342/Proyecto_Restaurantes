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
import { useAuth } from "../hooks/useAuth.js";

import kinalEatsLogo from "../../../../assets/logo1.png";
import authBackgroundVideo from "../../../../assets/fondoAuthPage.mp4";

const ForgotPasswordScreen = ({ navigation }) => {
    const { handleForgotPassword, loading } = useAuth();
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
            email: "",
        },
    });

    const onSubmit = async ({ email }) => {
        try {
            const result = await handleForgotPassword(email);
            showToast({
                type: "success",
                title: "Correo enviado",
                message:
                    result.message ||
                    "Te enviamos instrucciones para restablecer tu contrasena.",
            });
            navigation.navigate("Login");
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Error al enviar el correo";

            showToast({
                type: "error",
                title: "No se pudo enviar",
                message,
            });
        }
    };

    const onInvalid = (formErrors) => {
        showToast({
            type: "error",
            title: "Revisa tu correo",
            message: formErrors.email?.message || "Ingresa un correo valido.",
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

                        <Text style={styles.title}>Recuperar contrasena</Text>
                        <Text style={styles.subtitle}>
                            Te enviamos un enlace a tu correo.
                        </Text>

                        <View style={styles.notice}>
                            <Text style={styles.noticeText}>
                                Te enviaremos instrucciones para restablecer tu
                                contrasena al correo asociado a tu cuenta.
                            </Text>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>EMAIL</Text>
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: "El correo es obligatorio",
                                    pattern: {
                                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                        message: "Formato de email invalido",
                                    },
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <View
                                        style={[
                                            styles.inputShell,
                                            errors.email && styles.inputShellError,
                                            loading && styles.inputShellDisabled,
                                        ]}
                                    >
                                        <Feather name="mail" size={20} color="#8aa0bd" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="correo@restaurante.com"
                                            placeholderTextColor="#94a3b8"
                                            value={value}
                                            onChangeText={onChange}
                                            editable={!loading}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            textContentType="emailAddress"
                                        />
                                    </View>
                                )}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>

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
                                    ENVIAR CORREO
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            activeOpacity={0.82}
                            disabled={loading}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Feather name="arrow-left" size={15} color="#5f6f86" />
                            <Text style={styles.backButtonText}>VOLVER AL LOGIN</Text>
                        </TouchableOpacity>
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
        backgroundColor: "rgba(3, 7, 18, 0.5)",
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
        fontWeight: "900",
        lineHeight: 36,
        letterSpacing: 0,
    },
    subtitle: {
        color: "#64748b",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 23,
        marginTop: 5,
    },
    notice: {
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.32)",
        backgroundColor: "#fffbeb",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginTop: 28,
        marginBottom: 22,
    },
    noticeText: {
        color: "#78350f",
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 21,
    },
    fieldGroup: {
        marginBottom: 18,
    },
    label: {
        color: "#64748b",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2.4,
        marginBottom: 8,
    },
    inputShell: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    inputShellError: {
        borderColor: "#ef4444",
        backgroundColor: "#fff7f7",
    },
    inputShellDisabled: {
        opacity: 0.55,
    },
    input: {
        flex: 1,
        color: "#0f172a",
        fontSize: 15,
        fontWeight: "700",
        paddingVertical: 0,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 6,
    },
    primaryButton: {
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617",
        borderRadius: 12,
        shadowColor: "#020617",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 7,
    },
    disabledButton: {
        opacity: 0.72,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 2.6,
    },
    backButton: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        marginTop: 12,
    },
    backButtonText: {
        color: "#5f6f86",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 2.2,
    },
});

export default ForgotPasswordScreen;
