import { useState } from 'react'
import { ForgotPasswordForm } from "../components/ForgotPassword.jsx"
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/Register.jsx'
import logo from '../../../assets/images/logo1.png'
import fondoAuthPage from '../../../assets/images/fondoAuthPage.jpg'

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
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-4 md:p-8"
            style={{ backgroundImage: `url(${fondoAuthPage})` }}
        >
            <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden shadow-2xl shadow-orange-100 min-h-[540px] bg-white border border-orange-100">
                {/* Panel izquierdo — visual */}
                <div className="hidden md:flex w-[42%] bg-orange-100 flex-col justify-end p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(249,115,22,0.18)_0%,transparent_60%)]" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-36 h-36">
                            <div className="absolute inset-0 rounded-full bg-orange-300/20 blur-2xl" />
                            <div className="relative w-full h-full rounded-full bg-white/95 border border-white/80 flex items-center justify-center shadow-[0_25px_60px_rgba(249,115,22,0.24)]">
                                <img 
                                    src={logo} 
                                    alt="KinalEats logo" 
                                    className="w-24 h-24 rounded-full object-cover" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-200 rounded-full px-3 py-1 text-[11px] font-semibold text-orange-600 uppercase tracking-widest mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Panel de restaurante
                        </span>
                        <h2 className="text-slate-900 font-extrabold text-2xl leading-tight mb-2">
                            Gestiona cada
                            <br />
                            <span className="text-orange-600">orden al instante</span>
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Pedidos, reservas y métricas en un solo lugar.
                        </p>
                    </div>
                </div>

                {/* Panel derecho — formulario */}
                <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center">
                    <p className="text-orange-600 font-extrabold text-lg mb-7 tracking-tight">
                        ● KinalEats
                    </p>

                    <h1 className="text-slate-900 text-2xl font-bold mb-1">
                        {title}
                    </h1>
                    <p className="text-slate-600 text-sm mb-7">
                        {subtitle}
                    </p>

                    {view === 'forgot' ? (
                        <ForgotPasswordForm onSwitch={() => setView('login')} />
                    ) : view === 'register' ? (
                        <RegisterForm onBack={() => setView('login')} onSuccess={() => setView('login')} />
                    ) : (
                        <LoginForm onForgot={() => setView('forgot')} onRegister={() => setView('register')} />
                    )}

                    {view === 'login' && (
                        <div className="flex gap-6 mt-7 pt-5 border-t border-slate-200">
                            {[
                                ["2,400+", "Restaurantes activos"],
                                ["98.5%", "Uptime garantizado"],
                                ["4.9★", "Calificación promedio"],
                            ].map(([v, l]) => (
                                <div key={l}>
                                    <p className="text-slate-900 font-bold text-sm">{v}</p>
                                    <p className="text-slate-500 text-[11px]">{l}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

