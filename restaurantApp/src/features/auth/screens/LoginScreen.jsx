
import {
    View,
    Text,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from "react-native"

import { useForm, Controller } from "react-hook-form"
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme"
import Input from "../../../shared/components/Input"
import Button from "../../../shared/components/Button"
import { useAuth } from "../hooks/useAuth"

import kinalSportsLogo from "../../../../assets/kinal_sports.png"

const LoginScreen = ({ navigation }) => {

    const { handleLogin, loading } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: ""
        }
    })

    const onSubmit = async (data) => {
        try {
            await handleLogin(data)
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || "Error al iniciar sesion"
                Alert.alert("Error", message)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={kinalSportsLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <View>
                    <Controller
                        control={control}
                        rules={{ required: "Email o usuario requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email o usuario"
                                placeholder="correo@ejemplo.com o usuario"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.emailOrUsername?.message}
                            />
                        )}
                        name="emailOrUsername"
                    />

                    <Controller
                        control={control}
                        rules={{ required: "Contraseña requerida" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Contraseña"
                                placeholder="••••••••"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.password?.message}
                            />
                        )}
                        name="password"
                    />

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}                    
                    />

                    <View style={styles.footer}>
                        <Text sytle={styles.footerText}>¿No tienes cuenta?</Text>
                        <Text
                            style={styles.link}
                            onPress={() => navigation.navigate("Register")}
                        >
                            Registrate
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.xxl,
    },
    logo: {
        height: 80,
        width: 200,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.secondary,
        marginTop: SPACING.sm,
    },
    form: {
        width: "100%",
    },
    button: {
        marginTop: SPACING.lg,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textLight,
    },
    link: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: "700",
    },
});

export default LoginScreen;