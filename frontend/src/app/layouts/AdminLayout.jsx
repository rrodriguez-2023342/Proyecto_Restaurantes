import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { Avatar } from "../../shared/components";
import { PrincipalContainer } from "./PrincipalContainer.jsx";

const navItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/restaurants", label: "Restaurantes" },
    { to: "/admin/menus", label: "Menús" },
    { to: "/admin/reviews", label: "Reseñas" },
    { to: "/admin/users", label: "Usuarios" },
    { to: "/admin/stats", label: "Estadísticas" },
];

const linkClass = ({ isActive }) => {
    const base = "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition";
    return isActive
        ? `${base} bg-gradient-to-r from-orange-100 via-orange-50 to-white text-orange-700 shadow-sm`
        : `${base} text-slate-600 hover:bg-orange-50/70`;
};

export const AdminLayout = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <PrincipalContainer className="bg-slate-100">
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
                <aside className="border-r border-slate-200 bg-white/90 backdrop-blur">
                    <div className="px-5 py-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                            Kinal Eats
                        </p>
                        <h1 className="text-xl font-semibold text-slate-900">
                            Admin Panel
                        </h1>
                        <p className="mt-2 text-xs text-slate-500">
                            Gestion centralizada en tiempo real.
                        </p>
                    </div>
                    <nav className="flex flex-col gap-1 px-4 pb-6">
                        {navItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className={linkClass} end>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mx-4 mb-6 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                        <p className="text-xs text-slate-500">Sesion</p>
                        <div className="mt-2 flex items-center gap-3">
                            <Avatar
                                src={user?.profilePicture}
                                name={user?.name || user?.username || "Administrador"}
                                size={40}
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.name || user?.username || "Administrador"}
                                </p>
                                <p className="text-xs text-slate-500">{user?.role || "ADMIN_ROLE"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-3 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition"
                        >
                            Cerrar sesion
                        </button>
                    </div>
                </aside>

                <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
                    <header className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-white via-white to-orange-50/80 backdrop-blur">
                        <div className="px-6 py-4 flex flex-col gap-1">
                            <h2 className="text-lg font-semibold text-slate-900">Panel administrativo</h2>
                            <p className="text-sm text-slate-500">
                                Control general de restaurantes, menús, platos y reseñas.
                            </p>
                        </div>
                    </header>
                    <div className="p-6">
                        <Outlet />
                    </div>
                </section>
            </div>
        </PrincipalContainer>
    );
};
