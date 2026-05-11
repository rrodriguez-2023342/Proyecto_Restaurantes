import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { UserProfileDropdown } from "../../shared/components";
import { PrincipalContainer } from "./PrincipalContainer.jsx";
import { SideCart } from "../../features/orders/components/SideCart";
import { useCartStore } from "../../features/orders/store/useCartStore";
import logo from "../../assets/images/logo1.png";

 const navItems = [
     { to: "/home", label: "Inicio" },
     { to: "/home/restaurants", label: "Restaurantes" },
     { to: "/home/reviews", label: "Reseñas" },
     { to: "/home/orders", label: "Pedidos" },
     { to: "/reservaciones", label: "Reservaciones" },
     { to: "/home/invoices", label: "Facturas" },
 ];

const linkClass = ({ isActive }) => {
    const base = "rounded-full px-4 py-2 text-sm font-semibold transition";
    return isActive
    ? `${base} bg-orange-500 text-white shadow-sm`
    : `${base} text-slate-600 hover:bg-orange-50`;
};

export const PublicLayout = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <PrincipalContainer>
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Mobile Menu Button & Logo Area */}
                        <div className="flex items-center gap-3">
                             <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                             >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                                    )}
                                </svg>
                             </button>

                             <div className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl md:rounded-2xl bg-orange-500 shadow-lg shadow-orange-100">
                                <img 
                                    src={logo}
                                    alt="KinalEats Logo" 
                                    className="h-full w-full object-cover"
                                />
                             </div>
                             <div className="hidden xs:block">
                                <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">KinalEats</h1>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Premium Delivery</p>
                             </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {navItems.map((item) => (
                                <NavLink key={item.to} to={item.to} className={linkClass} end>
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Actions Area */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button 
                                onClick={() => setIsCartOpen(true)}
                                className="relative rounded-xl md:rounded-2xl bg-slate-900 p-2.5 md:p-3 text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-orange-500 text-[8px] md:text-[10px] font-black text-white ring-2 ring-white">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            <div className="h-8 w-px bg-slate-200 mx-0.5 md:mx-1" />

                            <UserProfileDropdown />
                            
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden md:block rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
                            >
                                Salir
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation - Hamburger Menu Overlay */}
                    {isMenuOpen && (
                        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-2xl animate-in slide-in-from-top duration-300">
                            <nav className="flex flex-col p-4 gap-2">
                                {navItems.map((item) => (
                                    <NavLink 
                                        key={item.to} 
                                        to={item.to} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center justify-between rounded-2xl px-6 py-4 text-sm font-black transition-all
                                            ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-slate-600 hover:bg-slate-50'}
                                        `}
                                        end
                                    >
                                        {item.label}
                                        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </NavLink>
                                ))}
                                <div className="h-px bg-slate-100 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Cerrar Sesión
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
                <Outlet />
            </main>

            <SideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </PrincipalContainer>
    );
};
