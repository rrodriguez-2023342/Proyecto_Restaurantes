import { useForm } from "react-hook-form"
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";

export const LoginForm = ({ onForgot, onRegister }) => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const login = useAuthStore(state => state.login);
    const loading = useAuthStore(state => state.loading);

    const onSubmit = async (data) => {
        const res = await login(data);
        if (res.success) {
            navigate("/principal");
            toast.success("¡Bienvenido de nuevo!", { duration: 4000 });
        } else {
            toast.error(res.message || "El usuario o contraseña son incorrectos", { duration: 4000 });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email o usuario */}
            <div>
                <label htmlFor="emailOrUsername" className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                    Email o usuario
                </label>
                <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="correo@restaurante.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition"
                    {...register("emailOrUsername", { required: "Este campo es requerido" })}
                />
                {errors.emailOrUsername && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.emailOrUsername.message}</p>
                )}
            </div>

            {/* Contraseña */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="text-[11px] font-semibold text-slate-700 uppercase tracking-widest">
                        Contraseña
                    </label>
                    <button
                        type="button"
                        onClick={onForgot}
                        className="text-xs font-medium text-orange-400 hover:text-orange-300 transition cursor-pointer"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition"
                    {...register("password", { required: "La contraseña es obligatoria" })}
                />
                {errors.password && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
            </div>

            {/* Botón principal */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer mt-1"
            >
                {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400">o</span>
                <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Botón registro */}
            <button
                type="button"
                disabled={loading}
                onClick={onRegister}
                className="w-full border border-orange-500/30 hover:bg-orange-500/8 hover:border-orange-500/50 rounded-xl py-3 text-sm font-medium text-orange-400 transition disabled:opacity-50 cursor-pointer"
            >
                {loading ? "Cargando..." : "Crear una cuenta"}
            </button>
        </form>
    )
}