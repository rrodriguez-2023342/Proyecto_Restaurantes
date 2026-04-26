import { useForm } from "react-hook-form";

export const ForgotPasswordForm = ({ onSwitch }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition"
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
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
            >
                Enviar correo
            </button>

            <p className="text-center text-sm text-slate-500">
                ¿Recordaste tu contraseña?{' '}
                <button
                    type="button"
                    className="text-orange-600 font-medium hover:text-orange-500 transition cursor-pointer"
                    onClick={onSwitch}
                >
                    Iniciar sesión
                </button>
            </p>
        </form>
    );
};
