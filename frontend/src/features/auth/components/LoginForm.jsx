import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Mail, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../../../shared/layouts/Spinner";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10";
const labelClass = "mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500";

export const LoginForm = ({ onForgot, onRegister }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);

    const onSubmit = async (data) => {
        const res = await login(data);
        if (res.success) {
            navigate("/principal");
            toast.success("Bienvenido de nuevo", { duration: 4000 });
        } else {
            const errorMsg = res.error || res.message || "Error al iniciar sesion";
            toast.error(errorMsg, { duration: 4000 });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="emailOrUsername" className={labelClass}>
                    Email o usuario
                </label>
                <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="emailOrUsername"
                        type="text"
                        placeholder="correo@restaurante.com"
                        className={inputClass}
                        {...register("emailOrUsername", { required: "Este campo es requerido" })}
                    />
                </div>
                {errors.emailOrUsername && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.emailOrUsername.message}</p>
                )}
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                        Contrasena
                    </label>
                    <button
                        type="button"
                        onClick={onForgot}
                        className="text-xs font-bold text-amber-700 transition hover:text-slate-950"
                    >
                        Olvide mi contrasena
                    </button>
                </div>
                <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="password"
                        type="password"
                        placeholder="********"
                        className={inputClass}
                        {...register("password", { required: "La contrasena es obligatoria" })}
                    />
                </div>
                {errors.password && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-xl shadow-slate-900/10 transition hover:bg-amber-500 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? <Spinner small label="Cargando..." /> : "Iniciar sesion"}
            </button>

            <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">o</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
                type="button"
                disabled={loading}
                onClick={onRegister}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 transition hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                <UserPlus size={15} />
                Crear una cuenta
            </button>
        </form>
    );
};
