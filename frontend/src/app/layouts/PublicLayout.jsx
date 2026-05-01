import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { Avatar } from "../../shared/components";
import { PrincipalContainer } from "./PrincipalContainer.jsx";

 const navItems = [
     { to: "/home", label: "Inicio" },
     { to: "/home/restaurants", label: "Restaurantes" },
     { to: "/home/reviews", label: "Reseñas" },
     { to: "/home/invoices", label: "Facturas" },
 ];

const linkClass = ({ isActive }) => {
    const base = "rounded-full px-4 py-2 text-sm font-semibold transition";
    return isActive
    ? `${base} bg-orange-500 text-white shadow-sm`
    : `${base} text-slate-600 hover:bg-orange-50`;
};

export const PublicLayout = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <PrincipalContainer>
            <header className="border-b border-slate-200 bg-gradient-to-r from-orange-50 via-white to-amber-50">
                <div className="mx-auto flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                            Kinal Eats
                        </p>
                        <h1 className="text-2xl font-semibold text-slate-900">Descubre restaurantes</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Explora opciones cerca de ti y guarda tus favoritos.
                        </p>
                    </div>
                    <nav className="flex flex-wrap gap-2">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={linkClass} end>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={user?.profilePicture}
                            name={user?.name || user?.username || "Usuario"}
                            size={36}
                        />
                        <span className="text-sm text-slate-600">
                            {user?.name || user?.username || "Usuario"}
                        </span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-orange-200 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>
        </PrincipalContainer>
    );
};
