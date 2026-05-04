import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore } from "../../features/auth/store/authStore";
import { showError, showSuccess } from "../utils/toast";
import { Avatar } from "./Avatar.jsx";
import { FormField } from "./FormField.jsx";

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

const InfoItem = ({ label, value }) => (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-slate-700">{value || "No registrado"}</p>
    </div>
);

export const UserProfileDropdown = ({ compact = false, align = "right", placement = "down" }) => {
    const wrapperRef = useRef(null);
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm();

    const profilePicture = useWatch({ control, name: "profilePicture" });
    const previewUrl = useMemo(() => {
        if (!profilePicture?.length) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

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
            phone: user.phone || "",
        });
    }, [reset, user]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    if (!user) return null;

    const submit = async (values) => {
        const payload = new FormData();
        payload.append("name", values.name);
        payload.append("surname", values.surname);
        payload.append("phone", values.phone);

        if (values.profilePicture?.[0]) {
            payload.append("profilePicture", values.profilePicture[0]);
        }

        const result = await updateProfile(payload);
        if (result.success) {
            showSuccess("Perfil actualizado");
            setIsEditing(false);
        } else {
            showError(result.error || "No se pudo actualizar el perfil");
        }
    };

    const cancelEdit = () => {
        reset({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
            profilePicture: null,
        });
        setIsEditing(false);
    };

    const panelPosition = align === "left" ? "left-0" : "right-0";
    const panelPlacement = placement === "up" ? "bottom-full mb-3" : "top-full mt-3";

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className={`flex items-center gap-3 rounded-full transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    compact ? "p-1" : "px-2 py-1"
                }`}
                aria-label="Abrir perfil de usuario"
                aria-expanded={isOpen}
            >
                <Avatar
                    src={user.profilePicture}
                    name={getFullName(user)}
                    size={compact ? 36 : 40}
                />
                {!compact && (
                    <span className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                            {getFullName(user)}
                        </span>
                        <span className="block truncate text-xs text-slate-500">{user.role || "USER_ROLE"}</span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute ${panelPosition} ${panelPlacement} z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl`}>
                    <div className="border-b border-slate-100 bg-orange-50 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={previewUrl || user.profilePicture}
                                name={getFullName(user)}
                                size={56}
                            />
                            <div className="min-w-0">
                                <p className="truncate text-base font-bold text-slate-900">{getFullName(user)}</p>
                                <p className="truncate text-xs font-medium text-orange-700">@{user.username}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="space-y-4 p-4">
                        {isEditing ? (
                            <>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <FormField label="Nombre" error={errors.name?.message}>
                                        <input
                                            {...register("name", { required: "El nombre es obligatorio" })}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-400"
                                        />
                                    </FormField>
                                    <FormField label="Apellido" error={errors.surname?.message}>
                                        <input
                                            {...register("surname", { required: "El apellido es obligatorio" })}
                                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-400"
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Telefono" error={errors.phone?.message}>
                                    <input
                                        {...register("phone", {
                                            required: "El telefono es obligatorio",
                                            pattern: {
                                                value: /^\d{8}$/,
                                                message: "El telefono debe tener 8 digitos",
                                            },
                                        })}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-400"
                                    />
                                </FormField>
                                <FormField label="Foto de perfil">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("profilePicture")}
                                        className="w-full rounded-lg border border-dashed border-orange-200 bg-orange-50/40 px-3 py-2 text-sm text-slate-600"
                                    />
                                </FormField>
                            </>
                        ) : (
                            <div className="grid gap-3">
                                <InfoItem label="Email" value={user.email} />
                                <InfoItem label="Telefono" value={user.phone} />
                                <InfoItem label="Rol" value={user.role} />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
                                    >
                                        {loading ? "Guardando..." : "Guardar"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400"
                                >
                                    Editar perfil
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
