import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Spinner } from "../../../shared/layouts/Spinner";

export const RegisterForm = ({ onBack, onSuccess }) => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm();

    const registerUser = useAuthStore((state) => state.register);
    const loading = useAuthStore((state) => state.loading);

    const submit = async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("surname", values.surname);
        formData.append("username", values.username);
        formData.append("email", values.email);
        formData.append("password", values.password);
        formData.append("phone", values.phone);

        const result = await registerUser(formData);

        if (result.success) {
            toast.success("Cuenta creada correctamente. Inicia sesión para continuar.", { duration: 4000 });
            onSuccess?.();
        } else {
            toast.error(result.error || "No se pudo crear la cuenta. Intenta de nuevo.", { duration: 4000 });
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Nombre
                    </label>
                    <input
                        {...register("name", { required: "El nombre es obligatorio" })}
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.name && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Apellido
                    </label>
                    <input
                        {...register("surname", { required: "El apellido es obligatorio" })}
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.surname && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.surname.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Nombre de usuario
                    </label>
                    <input
                        {...register("username", {
                            required: "El nombre de usuario es obligatorio",
                            minLength: {
                                value: 3,
                                message: "Debe tener al menos 3 caracteres",
                            },
                        })}
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.username && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.username.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Teléfono
                    </label>
                    <input
                        {...register("phone", {
                            required: "El teléfono es obligatorio",
                            pattern: {
                                value: /^[0-9]{8}$/,
                                message: "Debe ser un número de 8 dígitos",
                            },
                        })}
                        type="tel"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.phone && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.phone.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                    Email
                </label>
                <input
                    {...register("email", {
                        required: "El email es obligatorio",
                        pattern: {
                            value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                            message: "Formato de email inválido",
                        },
                    })}
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                />
                {errors.email && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Contraseña
                    </label>
                    <input
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                            minLength: {
                                value: 8,
                                message: "Debe tener al menos 8 caracteres",
                            },
                        })}
                        type="password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.password && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                        Confirmar contraseña
                    </label>
                    <input
                        {...register("confirmPassword", {
                            required: "Debe confirmar su contraseña",
                            validate: {
                                matchesPassword: (value) =>
                                    value === getValues("password") ||
                                    "Las contraseñas no coinciden",
                            },
                        })}
                        type="password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-orange-400 transition"
                    />
                    {errors.confirmPassword && (
                        <p className="text-rose-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                    Volver al ingreso
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-3 text-sm font-semibold text-white transition disabled:from-orange-400 disabled:to-orange-500 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? <Spinner small label="Registrando..." /> : "Crear cuenta"}
                </button>
            </div>
        </form>
    );
};
