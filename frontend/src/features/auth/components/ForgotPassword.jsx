import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from "../../../shared/layouts/Spinner";

export const ForgotPasswordForm = ({ onSwitch }) => {
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // TODO: Implementar llamada a la API para recuperar contraseña
            console.log(data);
            toast.success("Se envió un enlace de recuperación a tu email", { duration: 4000 });
            onSwitch();
        } catch (error) {
            toast.error("Error al enviar el correo", { duration: 4000 });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                    Email
                </label>

                <input
                    type="email"
                    placeholder="correo@restaurante.com"
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition disabled:opacity-50"
                    {...register("email", {
                        required: "El correo es obligatorio",
                    })}
                />

                {errors.email && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-3 text-sm font-semibold text-white transition disabled:from-orange-400 disabled:to-orange-500 disabled:cursor-not-allowed cursor-pointer"
            >
                {loading ? <Spinner small label="Enviando..." /> : "Enviar correo"}
            </button>

            <p className="text-center text-sm text-slate-500">
                ¿Recordaste tu contraseña?{' '}
                <button
                    type="button"
                    disabled={loading}
                    className="text-orange-600 font-medium hover:text-orange-500 transition cursor-pointer disabled:opacity-50"
                    onClick={onSwitch}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    );
};
