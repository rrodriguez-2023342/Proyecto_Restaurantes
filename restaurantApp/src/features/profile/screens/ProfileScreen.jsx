import React, { useState, useEffect } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { useToast } from "../../../shared/components/Toast.jsx";
import { updateUserProfile } from "../../../shared/api/user.js";
import { COLORS } from "../../../shared/constants/theme.js";

const ProfileField = ({
    control,
    error,
    icon,
    label,
    name,
    placeholder,
    rules,
    isEditing,
    keyboardType,
    staticValue,
    readOnly,
}) => {
    if (!isEditing || readOnly) {
        return (
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.staticShell, readOnly && styles.readOnlyShell]}>
                    <Feather name={icon} size={18} color={readOnly ? "#94a3b8" : "#64748b"} />
                    <Text style={[styles.staticText, readOnly && styles.readOnlyText]}>
                        {staticValue || placeholder}
                    </Text>
                    {readOnly && (
                        <Feather name="lock" size={14} color="#94a3b8" style={styles.lockIcon} />
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                rules={rules}
                render={({ field: { onChange, value } }) => (
                    <View style={[styles.inputShell, error && styles.inputShellError]}>
                        <Feather name={icon} size={18} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder={placeholder}
                            placeholderTextColor="#94a3b8"
                            onChangeText={onChange}
                            value={value}
                            keyboardType={keyboardType}
                            autoCapitalize={name === "phone" ? "none" : "words"}
                        />
                    </View>
                )}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const ProfileScreen = ({ navigation }) => {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const { showToast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            surname: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || user.Name || "",
                surname: user.surname || user.Surname || "",
                phone: user.phone || (user.UserProfile ? user.UserProfile.Phone : "") || "",
            });
            setImageUri(user.profilePicture || (user.UserProfile ? user.UserProfile.ProfilePicture : null));
        }
    }, [user, reset, isEditing]);

    const handlePickImage = async () => {
        if (!isEditing) return;

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            showToast({
                type: "error",
                title: "Permiso denegado",
                message: "Necesitamos permiso para acceder a tu galería.",
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const onSubmit = async (values) => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("surname", values.surname);
            formData.append("phone", values.phone);

            if (imageUri && imageUri !== (user.profilePicture || (user.UserProfile ? user.UserProfile.ProfilePicture : null))) {
                const uriParts = imageUri.split('/');
                const fileName = uriParts[uriParts.length - 1];
                const fileType = fileName.split('.').pop() || 'jpeg';
                
                formData.append('profilePicture', {
                    uri: imageUri,
                    name: fileName,
                    type: `image/${fileType}`
                });
            }

            const userId = user.id || user._id;
            const response = await updateUserProfile(userId, formData);

            if (response.data && response.data.success) {
                // El backend retorna buildUserResponse(updatedUser) en response.data.data
                const responseData = response.data.data || response.data.user;
                const updatedUser = {
                    ...user,
                    name: responseData?.name || values.name,
                    surname: responseData?.surname || values.surname,
                    phone: responseData?.phone || values.phone,
                    profilePicture: responseData?.profilePicture || imageUri,
                };
                
                updateUser(updatedUser);
                showToast({
                    type: "success",
                    title: "Perfil guardado",
                    message: "Tus datos se actualizaron correctamente.",
                });
                setIsEditing(false);
            } else {
                throw new Error(response.data?.message || "Error al actualizar perfil");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            showToast({
                type: "error",
                title: "Error al actualizar",
                message: err.response?.data?.message || err.message || "Ocurrió un problema.",
            });
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        const nameVal = user?.name || user?.Name || "";
        const surnameVal = user?.surname || user?.Surname || "";
        const initialN = nameVal.charAt(0) || "";
        const initialS = surnameVal.charAt(0) || "";
        return (initialN + initialS).toUpperCase() || "U";
    };

    const getFullName = () => {
        const nameVal = user?.name || user?.Name || "";
        const surnameVal = user?.surname || user?.Surname || "";
        return [nameVal, surnameVal].filter(Boolean).join(" ") || user?.username || "Usuario";
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.8}
                        onPress={() => (isEditing ? setIsEditing(false) : navigation.goBack())}
                    >
                        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? "Editar Perfil" : "Mi Perfil"}</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Avatar Card */}
                    <View style={styles.avatarCard}>
                        <TouchableOpacity
                            onPress={handlePickImage}
                            activeOpacity={isEditing ? 0.85 : 1}
                            style={styles.avatarOuter}
                        >
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.avatarFallback}>
                                    <Text style={styles.avatarFallbackText}>{getInitials()}</Text>
                                </View>
                            )}

                            {isEditing && (
                                <View style={styles.cameraBadge}>
                                    <Feather name="camera" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.profileName}>{getFullName()}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>
                                {user?.role || user?.Role || "USER_ROLE"}
                            </Text>
                        </View>
                    </View>

                    {/* Fields Group */}
                    <View style={styles.fieldsContainer}>
                        <ProfileField
                            control={control}
                            error={errors.name?.message}
                            icon="user"
                            label="NOMBRE"
                            name="name"
                            placeholder="Tu nombre"
                            isEditing={isEditing}
                            staticValue={user?.name || user?.Name}
                            rules={{
                                required: "El nombre es obligatorio",
                                minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
                            }}
                        />

                        <ProfileField
                            control={control}
                            error={errors.surname?.message}
                            icon="user"
                            label="APELLIDO"
                            name="surname"
                            placeholder="Tu apellido"
                            isEditing={isEditing}
                            staticValue={user?.surname || user?.Surname}
                            rules={{
                                required: "El apellido es obligatorio",
                                minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
                            }}
                        />

                        <ProfileField
                            control={control}
                            error={errors.phone?.message}
                            icon="phone"
                            label="TELÉFONO"
                            name="phone"
                            placeholder="Ej. 12345678"
                            isEditing={isEditing}
                            staticValue={user?.phone || (user?.UserProfile?.Phone)}
                            keyboardType="phone-pad"
                            rules={{
                                required: "El teléfono es obligatorio",
                                pattern: { value: /^\d{8}$/, message: "Debe ser de 8 dígitos exactos" },
                            }}
                        />

                        <ProfileField
                            icon="mail"
                            label="CORREO ELECTRÓNICO"
                            staticValue={user?.email || user?.Email}
                            placeholder="Sin correo"
                            isEditing={isEditing}
                            readOnly
                        />

                        <ProfileField
                            icon="at-sign"
                            label="NOMBRE DE USUARIO"
                            staticValue={user?.username || user?.Username}
                            placeholder="Sin usuario"
                            isEditing={isEditing}
                            readOnly
                        />
                    </View>

                    {/* Actions Row */}
                    <View style={styles.actionsContainer}>
                        {isEditing ? (
                            <View style={styles.editActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    activeOpacity={0.8}
                                    onPress={() => setIsEditing(false)}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelButtonText}>CANCELAR</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton]}
                                    activeOpacity={0.85}
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>GUARDAR</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.editModeButton]}
                                activeOpacity={0.85}
                                onPress={() => setIsEditing(true)}
                            >
                                <Feather name="edit-3" size={16} color="#fff" />
                                <Text style={styles.editModeButtonText}>EDITAR PERFIL</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.text,
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20,
    },
    avatarCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        marginBottom: 20,
    },
    avatarOuter: {
        width: 110,
        height: 110,
        borderRadius: 55,
        position: "relative",
        marginBottom: 16,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 55,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    avatarFallback: {
        flex: 1,
        borderRadius: 55,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    avatarFallbackText: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "900",
    },
    cameraBadge: {
        position: "absolute",
        bottom: 0,
        right: 4,
        backgroundColor: COLORS.accent,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2.5,
        borderColor: COLORS.surface,
    },
    profileName: {
        fontSize: 22,
        fontWeight: "900",
        color: COLORS.text,
        marginBottom: 8,
        textAlign: "center",
    },
    roleBadge: {
        backgroundColor: COLORS.accentSoft,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(217, 119, 6, 0.15)",
    },
    roleBadgeText: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: "800",
    },
    fieldsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        gap: 16,
    },
    fieldGroup: {
        width: "100%",
    },
    label: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 8,
    },
    staticShell: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    readOnlyShell: {
        backgroundColor: "#f1f5f9",
        borderColor: "#e2e8f0",
    },
    staticText: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.text,
    },
    readOnlyText: {
        color: "#64748b",
    },
    lockIcon: {
        marginLeft: "auto",
    },
    inputShell: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: "#dbe4ef",
    },
    inputShellError: {
        borderColor: COLORS.error,
        backgroundColor: "#fff7f7",
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "700",
        paddingVertical: 0,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 11,
        fontWeight: "600",
        marginTop: 6,
    },
    actionsContainer: {
        marginTop: 24,
    },
    actionButton: {
        height: 52,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    editModeButton: {
        backgroundColor: COLORS.primaryDark,
        shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.16,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    editModeButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 2,
    },
    editActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
    saveButton: {
        flex: 1.5,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
});

export default ProfileScreen;
