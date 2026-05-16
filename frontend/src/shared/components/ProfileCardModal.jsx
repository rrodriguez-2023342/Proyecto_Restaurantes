import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { Camera, Mail, Phone, Shield, Upload } from "lucide-react";
import { adminTheme } from "../../constants/theme";
import { useAuthStore } from "../../features/auth/store/authStore";
import { showError, showSuccess } from "../utils/toast";
import { Avatar } from "./Avatar";

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-amber-500/40">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-amber-400">
            <Icon size={17} strokeWidth={2} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">{value}</p>
        </div>
    </div>
);

export const ProfileCardModal = ({ isOpen, onClose }) => {
    const user = useAuthStore((state) => state.user);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm();

    const profilePicture = useWatch({ control, name: "profilePicture" });

    const previewUrl = useMemo(() => {
        if (!profilePicture || !profilePicture[0]) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (!user || !isOpen) return;
        reset({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
        });
    }, [reset, user, isOpen]);

    if (!isOpen || !user) return null;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setValue("profilePicture", event.target.files);
        }
    };

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
                showSuccess("Perfil actualizado");
                setIsEditing(false);
            } else {
                showError(result.error || "No se pudo actualizar el perfil");
            }
        } catch {
            showError("Error al actualizar");
        } finally {
            setIsSaving(false);
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

    const closeModal = () => {
        setIsEditing(false);
        onClose();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={closeModal}
        >
            <div
                className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.85)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative h-36 border-b border-slate-900 bg-slate-950">
                    <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
                    <div className="absolute left-10 top-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">KinalEats</p>
                        <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
                            {isEditing ? "Editar perfil" : "Perfil de usuario"}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-slate-400">
                            {isEditing ? "Actualiza tus datos principales." : "Informacion de la sesion activa."}
                        </p>
                    </div>
                </div>

                <div className="absolute left-10 top-24">
                    <div className="relative">
                        <div className="rounded-full bg-white p-1 shadow-[0_20px_40px_-18px_rgba(15,23,42,0.75)]">
                            <Avatar
                                src={previewUrl || user.profilePicture}
                                name={getFullName(user)}
                                size={110}
                                className="rounded-full object-cover ring-2 ring-slate-100"
                            />
                        </div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-amber-400 shadow-xl transition hover:!bg-amber-500 hover:!text-slate-950 active:scale-90"
                            >
                                <Camera size={18} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <div className="px-10 pb-10 pt-24">
                    {!isEditing ? (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                                    {getFullName(user)}
                                </h2>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.34em] text-slate-400">
                                    @{user.username}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <InfoItem icon={Phone} label="Telefono" value={user.phone || "Sin telefono"} />
                                <InfoItem icon={Shield} label="Rol" value={user.role === "ADMIN_ROLE" ? "Administrador" : user.role || "Miembro"} />
                                <InfoItem icon={Mail} label="Correo electronico" value={user.email} />
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => setIsEditing(true)} className={adminTheme.neutralButton}>
                                    Editar perfil
                                </button>
                                <button type="button" onClick={closeModal} className={adminTheme.primaryButton}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(submit)} className="space-y-6 animate-in fade-in duration-300">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mb-5 inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-amber-700 transition hover:bg-amber-50"
                                >
                                    <Upload size={14} strokeWidth={3} />
                                    {profilePicture ? "Nueva imagen" : "Cambiar imagen"}
                                </button>

                                <div className="space-y-5">
                                    <label className="block">
                                        <span className={adminTheme.label}>Nombre</span>
                                        <input
                                            {...register("name", { required: "Required" })}
                                            className={`mt-2 w-full ${adminTheme.input}`}
                                            placeholder="Nombre"
                                        />
                                        {errors.name && <p className="mt-2 text-xs font-bold text-rose-500">El nombre es obligatorio</p>}
                                    </label>

                                    <label className="block">
                                        <span className={adminTheme.label}>Apellido</span>
                                        <input
                                            {...register("surname", { required: "Required" })}
                                            className={`mt-2 w-full ${adminTheme.input}`}
                                            placeholder="Apellido"
                                        />
                                        {errors.surname && <p className="mt-2 text-xs font-bold text-rose-500">El apellido es obligatorio</p>}
                                    </label>

                                    <label className="block">
                                        <span className={adminTheme.label}>Telefono</span>
                                        <input
                                            {...register("phone", {
                                                required: "Required",
                                                pattern: { value: /^\d{8}$/, message: "8 digits" },
                                            })}
                                            className={`mt-2 w-full ${adminTheme.input}`}
                                            placeholder="Telefono de 8 digitos"
                                        />
                                        {errors.phone && <p className="mt-2 text-xs font-bold text-rose-500">Ingresa un telefono de 8 digitos</p>}
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={cancelEdit} className={adminTheme.neutralButton}>
                                    Descartar
                                </button>
                                <button type="submit" disabled={isSaving} className={adminTheme.primaryButton}>
                                    {isSaving ? "Actualizando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
