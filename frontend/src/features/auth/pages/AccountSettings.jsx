import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { showError, showSuccess } from "../../../shared/utils/toast.js";
import { Avatar } from "../../../shared/components";

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

export const AccountSettings = () => {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm({
        mode: "onChange",
    });

    const profilePicture = useWatch({ control, name: "profilePicture" });
    const email = useWatch({ control, name: "email" });
    const name = useWatch({ control, name: "name" });
    const phone = useWatch({ control, name: "phone" });

    const previewUrl = useMemo(() => {
        if (!profilePicture?.length) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
        return /^\d{8}$/.test(phone);
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (!user) return;
        reset({
            name: user.name || "",
            surname: user.surname || "",
            email: user.email || "",
            phone: user.phone || "",
            profilePicture: null,
        });
    }, [reset, user]);

    const submit = async (values) => {
        try {
            setIsSaving(true);
            const payload = new FormData();
            payload.append("name", values.name);
            payload.append("surname", values.surname);
            payload.append("phone", values.phone);

            if (values.profilePicture?.[0]) {
                payload.append("profilePicture", values.profilePicture[0]);
            }

            const result = await updateProfile(payload);
            if (result.success) {
                showSuccess("Perfil actualizado exitosamente");
                reset({
                    name: values.name,
                    surname: values.surname,
                    email: values.email,
                    phone: values.phone,
                    profilePicture: null,
                });
            } else {
                showError(result.error || "No se pudo actualizar el perfil");
            }
        } catch (error) {
            showError("Error al actualizar el perfil");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-slate-500">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-slate-900">Configuración de Cuenta</h1>
                    <p className="text-slate-600 mt-2">Gestiona tu perfil y preferencias</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSubmit(submit)} className="divide-y divide-slate-200">
                        {/* Profile Picture Section */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Foto de Perfil</h2>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <Avatar
                                        src={previewUrl || user.profilePicture}
                                        name={getFullName(user)}
                                        size={120}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block">
                                        <span className="sr-only">Selecciona una foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            {...register("profilePicture")}
                                            className="block w-full text-sm text-slate-600 cursor-pointer
                                                file:mr-3 file:py-2 file:px-4 file:rounded-lg
                                                file:border-0 file:text-sm file:font-semibold
                                                file:bg-orange-50 file:text-orange-600
                                                hover:file:bg-orange-100 file:cursor-pointer
                                                border border-dashed border-slate-300 rounded-lg p-3"
                                        />
                                    </label>
                                    <p className="text-xs text-slate-500 mt-2">Máximo 5MB. Formatos: PNG, JPG, GIF</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Información Personal</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Nombre
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        {...register("name", {
                                            required: "El nombre es obligatorio",
                                            minLength: {
                                                value: 2,
                                                message: "El nombre debe tener al menos 2 caracteres",
                                            },
                                        })}
                                        type="text"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                                            errors.name
                                                ? "border-red-300 bg-red-50 focus:border-red-400"
                                                : "border-slate-200 bg-slate-50 focus:border-orange-400"
                                        }`}
                                        placeholder="Tu nombre"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                                    )}
                                    {name && !errors.name && (
                                        <p className="text-xs text-green-600 mt-1">✓ Nombre válido</p>
                                    )}
                                </div>

                                {/* Surname Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Apellido
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        {...register("surname", {
                                            required: "El apellido es obligatorio",
                                            minLength: {
                                                value: 2,
                                                message: "El apellido debe tener al menos 2 caracteres",
                                            },
                                        })}
                                        type="text"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                                            errors.surname
                                                ? "border-red-300 bg-red-50 focus:border-red-400"
                                                : "border-slate-200 bg-slate-50 focus:border-orange-400"
                                        }`}
                                        placeholder="Tu apellido"
                                    />
                                    {errors.surname && (
                                        <p className="text-xs text-red-600 mt-1">{errors.surname.message}</p>
                                    )}
                                </div>

                                {/* Email Field (Read-only) */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email || ""}
                                        disabled
                                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">No se puede modificar</p>
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Teléfono
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        {...register("phone", {
                                            required: "El teléfono es obligatorio",
                                            pattern: {
                                                value: /^\d{8}$/,
                                                message: "El teléfono debe tener exactamente 8 dígitos",
                                            },
                                        })}
                                        type="tel"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
                                            errors.phone
                                                ? "border-red-300 bg-red-50 focus:border-red-400"
                                                : "border-slate-200 bg-slate-50 focus:border-orange-400"
                                        }`}
                                        placeholder="12345678"
                                        maxLength="8"
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                                    )}
                                    {phone && isValidPhone(phone) && !errors.phone && (
                                        <p className="text-xs text-green-600 mt-1">✓ Teléfono válido</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Section */}
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Información Adicional</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Rol
                                    </label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                                        {user.role || "No asignado"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Usuario
                                    </label>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                                        @{user.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-4 p-8 bg-slate-50">
                            <p className="text-sm text-slate-600">
                                {isDirty ? "Tienes cambios sin guardar" : "Todo está sincronizado"}
                            </p>
                            <button
                                type="submit"
                                disabled={isSaving || loading || !isDirty}
                                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-lg shadow-md transition-all disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving || loading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Información importante</p>
                            <p className="text-sm text-blue-800 mt-1">
                                No puedes cambiar tu correo electrónico ni contraseña desde aquí. Si necesitas hacer cambios en tu seguridad, contacta con soporte.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
