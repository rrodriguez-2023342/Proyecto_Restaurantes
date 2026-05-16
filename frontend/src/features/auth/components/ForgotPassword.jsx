import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Spinner } from "../../../shared/layouts/Spinner";
import { useAuthStore } from "../store/authStore";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 disabled:opacity-50";

export const ForgotPasswordForm = ({ onSwitch }) => {
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuthStore();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await forgotPassword(data.email);
            if (result.success) {
                toast.success(result.message, { duration: 4000 });
                onSwitch();
            } else {
                toast.error(result.error || "Error al enviar el correo", { duration: 4000 });
            }
        } catch (error) {
            toast.error("Error al enviar el correo", { duration: 4000 });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold leading-relaxed text-amber-900">
                    Te enviaremos instrucciones para restablecer tu contrasena al correo asociado a tu cuenta.
                </p>
            </div>

            <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                    Email
                </label>

                <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        placeholder="correo@restaurante.com"
                        disabled={loading}
                        className={inputClass}
                        {...register("email", {
                            required: "El correo es obligatorio",
                        })}
                    />
                </div>

                {errors.email && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-500">{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-xl shadow-slate-900/10 transition hover:bg-amber-500 hover:text-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? <Spinner small label="Enviando..." /> : "Enviar correo"}
            </button>

            <button
                type="button"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-950 hover:text-slate-950 active:scale-[0.98] disabled:opacity-50"
                onClick={onSwitch}
            >
                <ArrowLeft size={15} />
                Volver al login
            </button>
        </form>
    );
};
