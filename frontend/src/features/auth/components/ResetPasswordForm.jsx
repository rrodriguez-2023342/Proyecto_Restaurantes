import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"
import { Spinner } from "../../../shared/layouts/Spinner"

const EyeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 5C7.523 5 3.732 7.943 2.458 12C3.732 16.057 7.523 19 12 19C16.477 19 20.268 16.057 21.542 12C20.268 7.943 16.477 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

const EyeSlashIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 5C7.523 5 3.732 7.943 2.458 12C3.165 13.999 4.378 15.791 5.868 17.127" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.132 18.873C17.622 17.537 18.835 15.745 19.542 13.746C20.268 9.943 16.477 7 12 7C10.193 7 8.532 7.446 7.131 8.205" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 11C15 13.2091 13.2091 15 11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

export const ResetPasswordForm = ({ token, onSuccess }) => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm()
    const resetPassword = useAuthStore(state => state.resetPassword)
    const loading = useAuthStore(state => state.loading)
    const error = useAuthStore(state => state.error)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const password = watch("password", "")

    const onSubmit = async (data) => {
        if (!token) {
            toast.error("El enlace de recuperación no es válido.")
            return
        }

        if (data.password !== data.confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        const res = await resetPassword(token, data.password)

        if (res.success) {
            toast.success(res.message || "Contraseña actualizada exitosamente", { duration: 4000 })
            setTimeout(onSuccess, 1500)
        } else {
            toast.error(res.error || "Error al cambiar la contraseña", { duration: 4000 })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label htmlFor="password" className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                    Nueva contraseña
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition"
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                            minLength: {
                                value: 8,
                                message: "La contraseña debe tener al menos 8 caracteres"
                            }
                        })}
                    />

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                    >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-slate-700 uppercase tracking-widest mb-2">
                    Confirmar contraseña
                </label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-orange-50 transition"
                        {...register("confirmPassword", {
                            required: "Confirma tu contraseña",
                            validate: (value) => value === password || "Las contraseñas no coinciden"
                        })}
                    />

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                    >
                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-rose-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                    <p className="text-rose-600 text-sm">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-3 text-sm font-semibold text-white transition disabled:from-orange-400 disabled:to-orange-500 disabled:cursor-not-allowed"
            >
                {loading ? <Spinner small label="Actualizando..." /> : "Actualizar contraseña"}
            </button>
        </form>
    )
}
