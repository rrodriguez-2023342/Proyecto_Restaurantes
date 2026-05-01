import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../shared/components";
import { getMenus, getRestaurants, getReviews } from "../../../shared/api";

const quickLinks = [
    { label: "Restaurantes", to: "/admin/restaurants", description: "Gestion completa" },
    { label: "Menús", to: "/admin/menus", description: "Menús y platos" },
    { label: "Reseñas", to: "/admin/reviews", description: "Control de feedback" },
    { label: "Pedidos", to: "/admin/orders", description: "Flujo de pedidos" },
    { label: "Reservas", to: "/admin/reservations", description: "Agenda y mesas" },
    { label: "Facturas", to: "/admin/invoices", description: "Pagos y reportes" },
    { label: "Reportes", to: "/admin/reports", description: "Métricas del negocio" },
];

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        restaurants: null,
        menus: null,
        reviews: null,
    });
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [restaurantsRes, menusRes, reviewsRes] = await Promise.allSettled([
                getRestaurants({ isActive: true }),
                getMenus({ isActive: true }),
                getReviews(),
            ]);

            const getCount = (res, key) => {
                if (res.status === 'fulfilled') {
                    const data = res.value.data;
                    if (data?.total !== undefined) return data.total;
                    if (data?.pagination?.totalItems !== undefined) return data.pagination.totalItems;
                    const arr = data?.data || data?.[key] || data || [];
                    return arr.length || 0;
                }
                return 0;
            };

            setStats({
                restaurants: getCount(restaurantsRes, 'restaurantes'),
                menus: getCount(menusRes, 'menus'),
                reviews: getCount(reviewsRes, 'resenas'),
            });
        } catch (err) {
            console.error(err);
            setStats({ restaurants: null, menus: null, reviews: null });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Restaurantes activos",
            value: stats.restaurants,
            helper: "Se actualiza cuando crees restaurantes.",
        },
        {
            label: "Menús publicados",
            value: stats.menus,
            helper: "Se actualiza cuando agregues menús.",
        },
        {
            label: "Reseñas recientes",
            value: stats.reviews,
            helper: "Se actualiza cuando entren nuevas reseñas.",
        },
    ];
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Bienvenido al Panel Admin</h1>
                        <p className="mt-2 text-slate-600">
                            Controla restaurantes, menús, reseñas y la operación completa de tu plataforma.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchStats}
                        className="w-fit rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-white font-medium hover:shadow-lg transition-shadow"
                    >
                        🔄 Actualizar datos
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {statCards.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm hover:shadow-md transition"
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                            {item.label}
                        </p>
                        <p className="mt-3 text-4xl font-bold text-orange-600">
                            {loading ? "⟳" : item.value ?? "0"}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{item.helper}</p>
                    </div>
                ))}
            </div>

            {/* Quick Access */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Accesos Rápidos</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {quickLinks.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="group rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-orange-300 hover:shadow-md transition"
                        >
                            <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition">
                                {item.label}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                            <p className="mt-2 text-xs font-semibold text-orange-600">Abrir →</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
