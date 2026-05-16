import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../../../shared/layouts/Spinner";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10";
const labelClass = "mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500";
const errorClass = "mt-1.5 text-xs font-semibold text-rose-500";

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
            toast.success("Cuenta creada correctamente. Inicia sesion para continuar.", { duration: 4000 });
            onSuccess?.();
        } else {
            toast.error(result.error || "No se pudo crear la cuenta. Intenta de nuevo.", { duration: 4000 });
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nombre" error={errors.name?.message}>
                    <input
                        {...register("name", { required: "El nombre es obligatorio" })}
                        type="text"
                        className={inputClass}
                    />
                </Field>
                <Field label="Apellido" error={errors.surname?.message}>
                    <input
                        {...register("surname", { required: "El apellido es obligatorio" })}
                        type="text"
                        className={inputClass}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Usuario" error={errors.username?.message}>
                    <input
                        {...register("username", {
                            required: "El nombre de usuario es obligatorio",
                            minLength: {
                                value: 3,
                                message: "Debe tener al menos 3 caracteres",
                            },
                        })}
                        type="text"
                        className={inputClass}
                    />
                </Field>
                <Field label="Telefono" error={errors.phone?.message}>
                    <input
                        {...register("phone", {
                            required: "El telefono es obligatorio",
                            pattern: {
                                value: /^[0-9]{8}$/,
                                message: "Debe ser un numero de 8 digitos",
                            },
                        })}
                        type="tel"
                        className={inputClass}
                    />
                </Field>
            </div>

            <Field label="Email" error={errors.email?.message}>
                <input
                    {...register("email", {
                        required: "El email es obligatorio",
                        pattern: {
                            value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                            message: "Formato de email invalido",
                        },
                    })}
                    type="email"
                    className={inputClass}
                />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Contrasena" error={errors.password?.message}>
                    <input
                        {...register("password", {
                            required: "La contrasena es obligatoria",
                            minLength: {
                                value: 8,
                                message: "Debe tener al menos 8 caracteres",
                            },
                        })}
                        type="password"
                        className={inputClass}
                    />
                </Field>
                <Field label="Confirmar contrasena" error={errors.confirmPassword?.message}>
                    <input
                        {...register("confirmPassword", {
                            required: "Debe confirmar su contrasena",
                            validate: {
                                matchesPassword: (value) =>
                                    value === getValues("password") ||
                                    "Las contrasenas no coinciden",
                            },
                        })}
                        type="password"
                        className={inputClass}
                    />
                </Field>
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-950 hover:text-slate-950 active:scale-[0.98]"
                >
                    <ArrowLeft size={15} />
                    Volver
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-xl shadow-slate-900/10 transition hover:bg-amber-500 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <Spinner small label="Registrando..." /> : <><UserPlus size={15} /> Crear cuenta</>}
                </button>
            </div>
        </form>
    );
};

const Field = ({ label, error, children }) => (
    <div>
        <label className={labelClass}>{label}</label>
        {children}
        {error && <p className={errorClass}>{error}</p>}
    </div>
);
