import { useState } from 'react'
import { ForgotPasswordForm } from "../components/ForgotPassword.jsx"
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/Register.jsx'
import logo from '../../../assets/images/logo1.png'
import fondoAuthService from '../../../assets/videos/fondoAuthPage.mp4'

export const AuthPage = () => {
    const [view, setView] = useState('login')

    const title = view === 'forgot'
        ? 'Recuperar contraseña'
        : view === 'register'
            ? 'Crear una cuenta'
            : 'Bienvenido de nuevo'

    const subtitle = view === 'forgot'
        ? 'Te enviamos un enlace a tu correo.'
        : view === 'register'
            ? 'Completa el formulario para crear tu cuenta.'
            : 'Ingresa tus credenciales para continuar.'

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
            <div className="absolute inset-0 bg-slate-950/50" />

            <div className="relative z-10 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen">
                <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20 bg-white/95 border border-white/30 backdrop-blur-md">
                    {/* Panel izquierdo — visual (oculto en móvil) */}
                    <div className="hidden md:flex w-[40%] bg-orange-50 flex-col justify-end p-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(249,115,22,0.15)_0%,transparent_70%)]" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-xl shadow-orange-200/50 border border-orange-50">
                                <img 
                                    src={logo} 
                                    alt="KinalEats logo" 
                                    className="w-20 h-20 rounded-full object-cover" 
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <span className="inline-flex items-center gap-2 bg-orange-100/50 border border-orange-200/50 rounded-full px-3 py-1 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                Sistema Premium
                            </span>
                            <h2 className="text-slate-900 font-black text-3xl leading-tight mb-3">
                                Gestiona tu
                                <br />
                                <span className="text-orange-600">restaurante</span>
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                Pedidos, inventarios y reportes en la palma de tu mano.
                            </p>
                        </div>
                    </div>

                    {/* Panel derecho — formulario */}
                    <div className="flex-1 bg-white p-6 sm:p-10 flex flex-col justify-center min-h-[500px]">
                        <div className="md:hidden flex justify-center mb-8">
                             <img src={logo} alt="KinalEats" className="h-16 w-16 rounded-full shadow-lg" />
                        </div>

                        <p className="hidden md:block text-orange-600 font-black text-xl mb-8 tracking-tighter">
                            KinalEats
                        </p>

                        <h1 className="text-slate-900 text-2xl sm:text-3xl font-black mb-1 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-slate-500 text-sm sm:text-base mb-8 font-medium">
                            {subtitle}
                        </p>

                        <div className="w-full">
                            {view === 'forgot' ? (
                                <ForgotPasswordForm onSwitch={() => setView('login')} />
                            ) : view === 'register' ? (
                                <RegisterForm onBack={() => setView('login')} onSuccess={() => setView('login')} />
                            ) : (
                                <LoginForm onForgot={() => setView('forgot')} onRegister={() => setView('register')} />
                            )}
                        </div>

                        {view === 'login' && (
                            <div className="grid grid-cols-3 gap-4 mt-10 pt-6 border-t border-slate-100">
                                {[
                                    ["2K+", "Locales"],
                                    ["99%", "Uptime"],
                                    ["5★", "Rating"],
                                ].map(([v, l]) => (
                                    <div key={l} className="text-center md:text-left">
                                        <p className="text-slate-900 font-black text-sm">{v}</p>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{l}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

