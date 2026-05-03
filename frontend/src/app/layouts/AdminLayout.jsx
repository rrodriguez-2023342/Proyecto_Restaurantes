import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo1.png";
import { useAuthStore } from "../../features/auth/store/authStore";
import { Avatar } from "../../shared/components";
import { PrincipalContainer } from "./PrincipalContainer.jsx";

const Icon = ({ path }) => (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
    </svg>
);

const navItems = [
    { to: "/admin", label: "Dashboard", icon: "M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" },
    { to: "/admin/orders", label: "Pedidos", icon: "M9 5h6m-8 4h10m-11 4h12m-9 4h6M5 3h14v18H5z" },
    { to: "/admin/restaurants", label: "Restaurantes", icon: "M4 10h16M6 10v10h12V10M8 10V7a4 4 0 0 1 8 0v3" },
    { to: "/admin/users", label: "Usuarios", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
    { to: "/admin/menus", label: "Menu", icon: "M4 6h16M4 12h16M4 18h10" },
    { to: "/admin/platos", label: "Productos", icon: "M12 3v18M5 7h14M7 7v4a5 5 0 0 0 10 0V7" },
    { to: "/admin/reports", label: "Reportes", icon: "M4 19V5m5 14V9m5 10V7m5 12v-6" },
];

const secondaryNavItems = [
    { to: "/admin/detail-orders", label: "Detalle pedidos", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
    { to: "/admin/reservaciones", label: "Reservaciones", icon: "M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1-1v14H4V6a1 1 0 0 1 1-1Z" },
    { to: "/admin/mesas", label: "Mesas", icon: "M4 10h16M6 10v10m12-10v10M8 4h8l2 6H6l2-6Z" },
    { to: "/admin/reviews", label: "Resenas", icon: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" },
    { to: "/admin/stats", label: "Estadisticas", icon: "M4 19h16M7 16V9m5 7V5m5 11v-4" },
    { to: "/admin/invoices", label: "Facturas", icon: "M7 3h10l2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" },
];

const pageTitles = [...navItems, ...secondaryNavItems].reduce((acc, item) => {
    acc[item.to] = item.label;
    return acc;
}, {});

const linkClass = ({ isActive }) => {
    const base = "flex items-center gap-3 border-l-4 px-4 py-2.5 text-sm font-medium transition";
    return isActive
        ? `${base} border-orange-500 bg-orange-50 text-orange-700`
        : `${base} border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
};

export const AdminLayout = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const pageTitle =
        pageTitles[pathname] ||
        Object.entries(pageTitles).find(([path]) => path !== "/admin" && pathname.startsWith(path))?.[1] ||
        "Panel administrativo";

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <PrincipalContainer className="h-screen overflow-hidden bg-slate-50">
            <div className="flex h-screen min-h-0 overflow-hidden">
                <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
                        <img src={logo} alt="KinalEats logo" className="h-11 w-11 rounded-full object-cover shadow-sm" />
                        <div>
                            <p className="text-lg font-extrabold tracking-tight text-orange-600">KinalEats</p>
                            <p className="text-xs font-medium text-slate-500">Admin Panel</p>
                        </div>
                    </div>

                    <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto py-5">
                        <div>
                            <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Principal</p>
                            <div className="space-y-1">
                                {navItems.map((item) => (
                                    <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === "/admin"}>
                                        <Icon path={item.icon} />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Operacion</p>
                            <div className="space-y-1">
                                {secondaryNavItems.map((item) => (
                                    <NavLink key={item.to} to={item.to} className={linkClass}>
                                        <Icon path={item.icon} />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </nav>

                    <div className="border-t border-slate-100 p-4">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={user?.profilePicture}
                                name={user?.name || user?.username || "Administrador"}
                                size={40}
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {user?.name || user?.username || "Administrador"}
                                </p>
                                <p className="truncate text-xs text-slate-500">{user?.role || "ADMIN_ROLE"}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-4 w-full rounded-xl border border-orange-500/30 bg-white px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                        >
                            Cerrar sesion
                        </button>
                    </div>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
                    <header className="shrink-0 border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
                                <p className="text-sm text-slate-500">Gestion centralizada con datos en tiempo real.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 sm:inline-flex" title="Notificaciones">
                                    <Icon path="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0" />
                                </button>
                                <Avatar
                                    src={user?.profilePicture}
                                    name={user?.name || user?.username || "Administrador"}
                                    size={36}
                                />
                            </div>
                        </div>
                    </header>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                        <Outlet />
                    </div>
                </section>
            </div>
        </PrincipalContainer>
    );
};
