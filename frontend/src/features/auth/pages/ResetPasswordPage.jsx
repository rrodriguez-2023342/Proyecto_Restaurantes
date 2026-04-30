import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import logo from '../../../assets/images/logo1.png'
import fondoAuthService from '../../../assets/videos/fondoAuthPage.mp4'

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')
    const [isValidToken, setIsValidToken] = useState(true)

    useEffect(() => {
        if (!token || token.length < 40) {
            setIsValidToken(false)
        }
    }, [token])

    const handleSuccess = () => {
        navigate('/auth')
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <video
                className="absolute inset-0 w-full h-full object-cover"
                src={fondoAuthService}
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="absolute inset-0 bg-slate-950/60" />

            <div className="relative z-10 flex items-center justify-center p-4 min-h-screen">
                <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 bg-white/95 border border-white/30 backdrop-blur-sm">
                    <div className="hidden md:flex w-[42%] bg-orange-100 p-8 relative overflow-hidden flex-col justify-start items-center text-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(249,115,22,0.18)_0%,transparent_60%)]" />

                        <div className="relative z-10 mb-8 pt-6">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-[0_0_60px_rgba(255,100,0,0.35)] mx-auto">
                                <img src={logo} alt="KinalEats logo" className="w-20 h-20 rounded-full object-cover" />
                            </div>
                        </div>

                        <div className="relative z-10 max-w-[90%] mx-auto">
                            <span className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-200 rounded-full px-3 py-1 text-[11px] font-semibold text-orange-600 uppercase tracking-widest mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Recuperación de contraseña
                            </span>
                            <h2 className="text-slate-900 font-extrabold text-2xl leading-tight mb-2">
                                Restablece tu acceso
                                <br />
                                con seguridad y rapidez
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Usa el enlace enviado a tu correo para elegir una nueva contraseña y volver a ingresar al panel.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 bg-white px-8 py-10 md:px-12 md:py-12">
                        <div className="mb-8">
                            <p className="text-orange-600 font-extrabold text-lg mb-5 tracking-tight">● KinalEats</p>
                            <h1 className="text-slate-900 text-3xl sm:text-4xl font-bold mb-3">Restablecer contraseña</h1>
                            <p className="text-slate-600 text-sm sm:text-base max-w-xl">
                                Crea una nueva contraseña segura para continuar usando tu cuenta.
                            </p>
                        </div>

                        {isValidToken ? (
                            <ResetPasswordForm token={token} onSuccess={handleSuccess} />
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
                                    <h3 className="text-red-900 font-semibold text-lg mb-2">Enlace inválido o expirado</h3>
                                    <p className="text-red-600 text-sm leading-relaxed">
                                        El enlace no es válido o ya expiró. Regresa al inicio de sesión para solicitar uno nuevo.
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate('/auth')}
                                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-3 text-sm font-semibold text-white transition"
                                >
                                    Volver a iniciar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
