import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { adminTheme } from "../../../constants/theme";
import { Avatar, FormField } from "../../../shared/components";

export const UserDetailModal = ({ user, isOpen, onClose, onUpdateUser, loading, currentUserId }) => {
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
        if (!profilePicture || !profilePicture.length) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (user && isOpen) {
            reset({
                name: user.name || "",
                surname: user.surname || "",
                phone: user.phone || "",
                role: user.role || "USER_ROLE",
            });
            setIsEditing(false);
        }
    }, [user, isOpen, reset]);

    if (!isOpen || !user) return null;

    const userId = user.id || user._id;
    const isCurrentUser = currentUserId === userId;

    const submit = async (values) => {
        try {
            const payload = new FormData();
            payload.append("name", values.name);
            payload.append("surname", values.surname);
            payload.append("phone", values.phone);
            payload.append("roleName", values.role);

            if (values.profilePicture?.[0]) {
                payload.append("profilePicture", values.profilePicture[0]);
            }

            if (typeof onUpdateUser !== "function") {
                console.error("onUpdateUser is not a function", onUpdateUser);
                return;
            }

            const ok = await onUpdateUser(userId, payload);
            if (ok) {
                setIsEditing(false);
                onClose();
            }
        } catch (error) {
            console.error("Error in UserDetailModal submit:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_90px_-42px_rgba(15,23,42,0.8)]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-900 bg-slate-950 px-6 py-5 text-white">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Gobierno de acceso</p>
                        <h3 className="mt-2 text-xl font-black uppercase tracking-tight">
                            {isEditing ? "Editar usuario" : "Detalle de usuario"}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-slate-400">
                            {isEditing ? "Modifica la informacion del perfil." : "Consulta informacion y ajusta el rol."}
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="shrink-0 rounded-xl border border-amber-500/40 bg-amber-500 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-950 transition hover:!bg-white active:scale-[0.98]"
                        >
                            Editar perfil
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-5 p-6">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="relative">
                            <Avatar
                                src={previewUrl || user.profilePicture}
                                name={`${user.name || ""} ${user.surname || ""}`}
                                size={64}
                            />
                            {isEditing && (
                                <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-slate-950 p-1 text-amber-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-lg font-black text-slate-950">{getFullName(user)}</p>
                            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600">@{user.username}</span>
                                <span className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">{user.role}</span>
                            </p>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Nombre" error={errors.name?.message}>
                                    <input {...register("name", { required: "El nombre es obligatorio" })} className={adminTheme.input} />
                                </FormField>
                                <FormField label="Apellido" error={errors.surname?.message}>
                                    <input {...register("surname", { required: "El apellido es obligatorio" })} className={adminTheme.input} />
                                </FormField>
                            </div>
                            <FormField label="Telefono" error={errors.phone?.message}>
                                <input {...register("phone")} className={adminTheme.input} />
                            </FormField>
                            <FormField label="Foto de perfil">
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("profilePicture")}
                                    className="w-full rounded-xl border border-dashed border-amber-500/40 bg-amber-50/40 px-4 py-3 text-sm font-semibold text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.18em] file:text-white"
                                />
                            </FormField>
                            <FormField label="Rol (Admin Only)">
                                <select {...register("role")} disabled={isCurrentUser} className={adminTheme.select}>
                                    <option value="USER_ROLE">USER_ROLE (Cliente)</option>
                                    <option value="ADMIN_RESTAURANT_ROLE">ADMIN_RESTAURANT_ROLE (Dueno)</option>
                                    <option value="ADMIN_ROLE">ADMIN_ROLE (Super Admin)</option>
                                </select>
                            </FormField>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Email</p>
                                <p className="mt-2 break-words text-sm font-semibold text-slate-700">{user.email}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Telefono</p>
                                <p className="mt-2 text-sm font-semibold text-slate-700">{user.phone || "Sin telefono"}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className={adminTheme.neutralButton}>
                            {isEditing ? "Cancelar" : "Cerrar"}
                        </button>
                        {isEditing && (
                            <button type="submit" disabled={loading} className={adminTheme.primaryButton}>
                                {loading ? "Guardando..." : "Guardar cambios"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const getFullName = (user) =>
    [user.name, user.surname].filter(Boolean).join(" ") || "Usuario";
