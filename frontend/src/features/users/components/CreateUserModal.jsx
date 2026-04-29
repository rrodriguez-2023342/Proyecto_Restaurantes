import { useForm, useWatch } from "react-hook-form";
import { useMemo } from "react";
import { FormField } from "../../../shared/components";

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading }) => {
    const {
        register,
        handleSubmit,
        reset,
        getValues,
        control,
        formState: { errors },
    } = useForm();

    const profilePicture = useWatch({ control, name: "profilePicture" });
    const previewUrl = useMemo(() => {
        if (!profilePicture || !profilePicture.length) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

    if (!isOpen) return null;

    const submit = async (values) => {
        const payload = new FormData();
        payload.append("name", values.name);
        payload.append("surname", values.surname);
        payload.append("username", values.username);
        payload.append("email", values.email);
        payload.append("password", values.password);
        payload.append("phone", values.phone);
        payload.append("roleName", values.roleName);
        if (values.profilePicture?.[0]) {
            payload.append("profilePicture", values.profilePicture[0]);
        }

        const ok = await onCreate(payload);
        if (ok) {
            reset();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4 text-white">
                    <h3 className="text-lg font-semibold">Nuevo usuario</h3>
                    <p className="text-xs text-white/80">Registra usuarios administrativos o clientes.</p>
                </div>
                <form onSubmit={handleSubmit(submit)} className="space-y-4 p-6">
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
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Usuario" error={errors.username?.message}>
                            <input
                                {...register("username", { required: "El usuario es obligatorio" })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            />
                        </FormField>
                        <FormField label="Telefono" error={errors.phone?.message}>
                            <input
                                {...register("phone", {
                                    required: "El telefono es obligatorio",
                                    pattern: {
                                        value: /^\d{8}$/, 
                                        message: "El telefono debe tener 8 dígitos"
                                    }
                                })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            />
                        </FormField>
                    </div>
                    <FormField label="Email" error={errors.email?.message}>
                        <input
                            {...register("email", { required: "El email es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                        />
                    </FormField>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Contrasena" error={errors.password?.message}>
                            <input
                                type="password"
                                {...register("password", { required: "La contrasena es obligatoria", minLength: 8 })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            />
                        </FormField>
                        <FormField label="Confirmar" error={errors.confirmPassword?.message}>
                            <input
                                type="password"
                                {...register("confirmPassword", {
                                    required: "Confirma la contrasena",
                                    validate: (value) => value === getValues("password") || "No coincide",
                                })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            />
                        </FormField>
                    </div>
                    <FormField label="Rol" error={errors.roleName?.message}>
                        <select
                            {...register("roleName", { required: "El rol es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                        >
                            <option value="">Selecciona un rol</option>
                            <option value="ADMIN_ROLE">ADMIN_ROLE (Super Admin)</option>
                            <option value="ADMIN_RESTAURANT_ROLE">ADMIN_RESTAURANT_ROLE (Due\u00F1o)</option>
                            <option value="USER_ROLE">USER_ROLE (Cliente)</option>
                        </select>
                    </FormField>
                    <FormField label="Foto de perfil (opcional)">
                        <div className="flex flex-col gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                {...register("profilePicture")}
                                className="w-full rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-2 text-sm"
                            />
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-orange-200"
                                />
                            )}
                        </div>
                    </FormField>

                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : "Crear usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
