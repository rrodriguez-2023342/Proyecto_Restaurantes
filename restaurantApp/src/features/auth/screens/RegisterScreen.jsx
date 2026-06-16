import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/theme.js";
import Input from "../../../shared/components/Input.jsx";
import Button from "../../../shared/components/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

import kinalSportsLogo from "../../../../assets/kinal_sports.png"

const RegisterScreen = ({ navigation }) => {

    const { handleRegister, loading } = useAuth()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            phone: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleRegister(data)

            Alert.alert(
                "Registro exitoso",
                "Tu cuenta ha sido creada. Ahora puedes iniciar sesion"
                [{ text: "OK", onPress: () => navigation.navigate("Login")}]
            )
        } catch (error) {
            console.error(error)
            const message = error.response?.data?.message || "Error al registrarse"
            Alert.alert("Error", message)
        }
    };

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
                    <Text style={styles.subtitle}>Únete a Kinal Sports</Text>
                </View>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        rules={{ required: "Nombre requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Nombre"
                                placeholder="Tu nombre"
                                onChangeText={onChange}
                                value={value}
                                error={errors.name?.message}
                            />
                        )}
                        name="name"
                    />

                    <Controller
                        control={control}
                        rules={{ required: "Apellido requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Apellido"
                                placeholder="Tu apellido"
                                onChangeText={onChange}
                                value={value}
                                error={errors.surname?.message}
                            />
                        )}
                        name="surname"
                    />

                    <Controller
                        control={control}
                        rules={{ required: "Usuario requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Usuario"
                                placeholder="nombre_usuario"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.username?.message}
                            />
                        )}
                        name="username"
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: "Teléfono requerido",
                            pattern: {
                                value: /^\d{8}$/,
                                message: "Debe tener exactamente 8 dígitos",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Teléfono"
                                placeholder="Ej: 12345678"
                                keyboardType="numeric"
                                onChangeText={onChange}
                                value={value}
                                error={errors.phone?.message}
                            />
                        )}
                        name="phone"
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: "Email requerido",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Email inválido",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email"
                                placeholder="correo@ejemplo.com"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={errors.email?.message}
                            />
                        )}
                        name="email"
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: "Contraseña requerida",
                            minLength: { value: 6, message: "Mínimo 6 caracteres" },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Contraseña"
                                placeholder="••••••••"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                error={errors.password?.message}
                            />
                        )}
                        name="password"
                    />

                    <Button
                        title="Registrarse"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                        <Text
                            style={styles.link}
                            onPress={() => navigation.navigate("Login")}
                        >
                            Inicia Sesión
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        paddingVertical: SPACING.xxl,
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.xl,
        marginTop: SPACING.lg,
    },
    logo: {
        height: 60,
        width: 180,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
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
        paddingBottom: SPACING.xxl,
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

export default RegisterScreen;