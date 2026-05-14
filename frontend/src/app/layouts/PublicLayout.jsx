import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { UserProfileDropdown } from "../../shared/components";
import { PrincipalContainer } from "./PrincipalContainer.jsx";
import { SideCart } from "../../features/orders/components/SideCart";
import { useCartStore } from "../../features/orders/store/useCartStore";
import logo from "../../assets/images/logo1.png";

const navItems = [
    { to: "/home", label: "INICIO" },
    { to: "/home/restaurants", label: "RESTAURANTES" },
    { to: "/home/reviews", label: "RESEÑAS" },
    { to: "/home/orders", label: "PEDIDOS" },
    { to: "/reservaciones", label: "RESERVAS" },
    { to: "/home/invoices", label: "FACTURAS" },
];

const linkClass = ({ isActive }) => {
    const base = "text-[11px] font-black tracking-[0.25em] transition-all duration-300 py-1.5 border-b-2 border-transparent";
    return isActive
        ? `${base} text-orange-600 border-orange-600`
        : `${base} text-slate-500 hover:text-slate-900`;
};

export const PublicLayout = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <PrincipalContainer>
            {/* Professional Dark Navbar - Dreamhub Inspired */}
            <header 
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
                    scrolled ? "bg-white/95 py-2 shadow-2xl backdrop-blur-md border-b border-slate-100" : "bg-white py-4"
                }`}
            >
                <div className="px-6 md:px-12 lg:px-16">
                    <div className="flex items-center justify-between">
                        
                        {/* Logo Area */}
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/home")}>
                                <div className="h-12 w-12 overflow-hidden">
                                    <img 
                                        src={logo}
                                        alt="KinalEats Logo" 
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-black text-slate-900 tracking-[0.1em] leading-none uppercase">Kinal<span className="text-orange-500">Eats</span></h1>
                                    <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1.5">Gourmet Experience</p>
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden xl:flex items-center gap-10">
                                {navItems.map((item) => (
                                    <NavLink key={item.to} to={item.to} className={linkClass} end>
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="group relative p-2 text-slate-700 hover:text-orange-500 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-lg border-2 border-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            <div className="h-8 w-px bg-slate-200" />

                            <div className="flex items-center gap-5">
                                <UserProfileDropdown compact />
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center gap-2 border-2 border-slate-950 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                >
                                    Salir
                                </button>
                                
                                {/* Mobile Menu Button */}
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="xl:hidden p-2 text-slate-900"
                                >
                                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="xl:hidden fixed inset-0 top-[70px] bg-white z-50 p-8 animate-in fade-in slide-in-from-right duration-500">
                            <nav className="flex flex-col gap-8">
                                {navItems.map((item) => (
                                    <NavLink 
                                        key={item.to} 
                                        to={item.to} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) => `
                                            text-3xl font-black tracking-tighter transition-all uppercase
                                            ${isActive ? 'text-orange-500' : 'text-slate-300'}
                                        `}
                                        end
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                                <div className="h-px bg-slate-100 my-4" />
                                <button
                                    onClick={handleLogout}
                                    className="text-left text-rose-600 text-2xl font-black tracking-tighter uppercase"
                                >
                                    Cerrar Sesión
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Content Spacer */}
            <div className="h-[70px] md:h-[80px]" />

            <main className="w-full">
                <Outlet />
            </main>

            <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </PrincipalContainer>
    );
};
