import { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Avatar, FormField } from "../../../shared/components";

export const UserDetailModal = ({ user, isOpen, onClose, onSaveRole, onUpdateUser, loading, currentUserId }) => {
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

    const isCurrentUser = currentUserId === user.id;

    const submit = async (values) => {
        try {
            const payload = new FormData();
            payload.append("name", values.name);
            payload.append("surname", values.surname);
            payload.append("phone", values.phone);
            payload.append("roleName", values.role); // Role name for the backend
            
            if (values.profilePicture?.[0]) {
                payload.append("profilePicture", values.profilePicture[0]);
            }

            if (typeof onUpdateUser !== 'function') {
                console.error("onUpdateUser is not a function", onUpdateUser);
                return;
            }

            const ok = await onUpdateUser(user.id || user._id, payload);
            if (ok) {
                setIsEditing(false);
                onClose();
            }
        } catch (error) {
            console.error("Error in UserDetailModal submit:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">{isEditing ? "Editar usuario" : "Detalle de usuario"}</h3>
                        <p className="text-xs text-white/80">
                            {isEditing ? "Modifica la información del perfil." : "Consulta información y ajusta el rol."}
                        </p>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-full text-xs font-semibold transition"
                        >
                            Editar perfil
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-4 p-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar
                                src={previewUrl || user.profilePicture}
                                name={`${user.name || ""} ${user.surname || ""}`}
                                size={64}
                            />
                            {isEditing && (
                                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full border-2 border-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-800">
                                {getFullName(user)}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">@{user.username}</span>
                                <span className="text-slate-300">|</span>
                                <span className="text-xs uppercase font-semibold text-orange-600">{user.role}</span>
                            </p>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Nombre" error={errors.name?.message}>
                                    <input
                                        {...register("name", { required: "El nombre es obligatorio" })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                                    />
                                </FormField>
                                <FormField label="Apellido" error={errors.surname?.message}>
                                    <input
                                        {...register("surname", { required: "El apellido es obligatorio" })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                                    />
                                </FormField>
                            </div>
                            <FormField label="Teléfono" error={errors.phone?.message}>
                                <input
                                    {...register("phone")}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                                />
                            </FormField>
                            <FormField label="Foto de perfil">
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("profilePicture")}
                                    className="w-full rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-2 text-sm"
                                />
                            </FormField>
                            <FormField label="Rol (Admin Only)">
                                <select
                                    {...register("role")}
                                    disabled={isCurrentUser}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                                >
                                    <option value="USER_ROLE">USER_ROLE (Cliente)</option>
                                    <option value="ADMIN_RESTAURANT_ROLE">ADMIN_RESTAURANT_ROLE (Due\u00F1o)</option>
                                    <option value="ADMIN_ROLE">ADMIN_ROLE (Super Admin)</option>
                                </select>
                            </FormField>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</p>
                                <p className="mt-0.5 text-sm text-slate-700 font-medium">{user.email}</p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Teléfono</p>
                                <p className="mt-0.5 text-sm text-slate-700 font-medium">{user.phone || "Sin teléfono"}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-slate-200 px-6 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                            {isEditing ? "Cancelar" : "Cerrar"}
                        </button>
                        {isEditing && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-full bg-orange-500 px-6 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition shadow-lg shadow-orange-200"
                            >
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
