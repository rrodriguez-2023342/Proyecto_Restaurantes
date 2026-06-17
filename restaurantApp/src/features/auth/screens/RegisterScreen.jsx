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

const RegisterField = ({
    autoCapitalize,
    control,
    error,
    keyboardType,
    label,
    name,
    rules,
    secureTextEntry,
    textContentType,
}) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <TextInput
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize={autoCapitalize || "none"}
                    keyboardType={keyboardType}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={secureTextEntry}
                    textContentType={textContentType}
                />
            )}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const RegisterScreen = ({ navigation }) => {
    const { handleRegister, loading } = useAuth();
    const { showToast } = useToast();

    const backgroundPlayer = useVideoPlayer(authBackgroundVideo, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    const {
        control,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
        },
    });

    const onSubmit = async ({ confirmPassword, ...data }) => {
        try {
            await handleRegister(data);
            showToast({
                type: "success",
                title: "Cuenta creada",
                message: "Inicia sesion para continuar.",
            });
            navigation.navigate("Login");
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "No se pudo crear la cuenta. Intenta de nuevo.";

            showToast({
                type: "error",
                title: "No se pudo registrar",
                message,
            });
        }
    };

    const onInvalid = (formErrors) => {
        const firstError =
            formErrors.name?.message ||
            formErrors.surname?.message ||
            formErrors.username?.message ||
            formErrors.phone?.message ||
            formErrors.email?.message ||
            formErrors.password?.message ||
            formErrors.confirmPassword?.message;

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

                        <Text style={styles.title}>Crear una cuenta</Text>
                        <Text style={styles.subtitle}>
                            Completa el formulario para crear tu cuenta.
                        </Text>

                        <View style={styles.form}>
                            <View style={styles.fieldRow}>
                                <RegisterField
                                    control={control}
                                    error={errors.name?.message}
                                    label="NOMBRE"
                                    name="name"
                                    rules={{ required: "El nombre es obligatorio" }}
                                    autoCapitalize="words"
                                    textContentType="givenName"
                                />

                                <RegisterField
                                    control={control}
                                    error={errors.surname?.message}
                                    label="APELLIDO"
                                    name="surname"
                                    rules={{ required: "El apellido es obligatorio" }}
                                    autoCapitalize="words"
                                    textContentType="familyName"
                                />
                            </View>

                            <View style={styles.fieldRow}>
                                <RegisterField
                                    control={control}
                                    error={errors.username?.message}
                                    label="USUARIO"
                                    name="username"
                                    rules={{
                                        required: "El nombre de usuario es obligatorio",
                                        minLength: {
                                            value: 3,
                                            message: "Debe tener al menos 3 caracteres",
                                        },
                                    }}
                                    textContentType="username"
                                />

                                <RegisterField
                                    control={control}
                                    error={errors.phone?.message}
                                    label="TELEFONO"
                                    name="phone"
                                    rules={{
                                        required: "El telefono es obligatorio",
                                        pattern: {
                                            value: /^[0-9]{8}$/,
                                            message: "Debe ser un numero de 8 digitos",
                                        },
                                    }}
                                    keyboardType="phone-pad"
                                    textContentType="telephoneNumber"
                                />
                            </View>

                            <RegisterField
                                control={control}
                                error={errors.email?.message}
                                label="EMAIL"
                                name="email"
                                rules={{
                                    required: "El email es obligatorio",
                                    pattern: {
                                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                        message: "Formato de email invalido",
                                    },
                                }}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                            />

                            <View style={styles.fieldRow}>
                                <RegisterField
                                    control={control}
                                    error={errors.password?.message}
                                    label="CONTRASENA"
                                    name="password"
                                    rules={{
                                        required: "La contrasena es obligatoria",
                                        minLength: {
                                            value: 8,
                                            message: "Debe tener al menos 8 caracteres",
                                        },
                                    }}
                                    secureTextEntry
                                    textContentType="newPassword"
                                />

                                <RegisterField
                                    control={control}
                                    error={errors.confirmPassword?.message}
                                    label="CONFIRMAR CONTRASENA"
                                    name="confirmPassword"
                                    rules={{
                                        required: "Debe confirmar su contrasena",
                                        validate: (value) =>
                                            value === getValues("password") ||
                                            "Las contrasenas no coinciden",
                                    }}
                                    secureTextEntry
                                    textContentType="newPassword"
                                />
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.backButton}
                                activeOpacity={0.82}
                                disabled={loading}
                                onPress={() => navigation.navigate("Login")}
                            >
                                <Feather name="arrow-left" size={15} color="#5f6f86" />
                                <Text style={styles.backButtonText}>VOLVER</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.primaryButton, loading && styles.disabledButton]}
                                activeOpacity={0.86}
                                disabled={loading}
                                onPress={handleSubmit(onSubmit, onInvalid)}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <>
                                        <Feather name="user-plus" size={15} color="#ffffff" />
                                        <Text style={styles.primaryButtonText}>
                                            CREAR CUENTA
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
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
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
        elevation: 12,
    },
    logoWrap: {
        width: 68,
        height: 68,
        borderRadius: 34,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        marginBottom: 22,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 6,
    },
    logo: {
        width: 58,
        height: 58,
    },
    title: {
        color: "#111b35",
        fontSize: 28,
        fontWeight: "900",
        lineHeight: 34,
        letterSpacing: 0,
    },
    subtitle: {
        color: "#64748b",
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 23,
        marginTop: 5,
    },
    form: {
        marginTop: 26,
    },
    fieldRow: {
        flexDirection: "column",
    },
    fieldGroup: {
        flex: 1,
        marginBottom: 16,
    },
    label: {
        color: "#64748b",
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2.4,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
        fontSize: 14,
        fontWeight: "700",
        paddingHorizontal: 15,
        paddingVertical: 0,
    },
    inputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fff7f7",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 6,
    },
    actions: {
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        paddingTop: 20,
        marginTop: 4,
    },
    backButton: {
        height: 49,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
    },
    backButtonText: {
        color: "#5f6f86",
        fontSize: 11,
        fontWeight: "900",
        letterSpacing: 2.2,
    },
    primaryButton: {
        height: 49,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        backgroundColor: "#020617",
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
});

export default RegisterScreen;
