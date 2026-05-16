import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, DataTable } from "../../../shared/components";
import { getMenus, getOrders, getRestaurants, getReviews, getUsers } from "../../../shared/api";
import { adminTheme } from "../../../constants/theme";
import { OrderStatus } from "../../orders/components/OrderStatus.jsx";
import { useAuthStore } from "../../auth/store/authStore";

const getItems = (res, key) => {
    const data = res?.value?.data || res?.data || {};
    if (Array.isArray(data)) return data;
    return data?.data || data?.[key] || data?.items || [];
};

const getCount = (res, key) => {
    const data = res?.value?.data || {};
    if (data?.total !== undefined) return data.total;
    if (data?.pagination?.totalItems !== undefined) return data.pagination.totalItems;
    return getItems(res, key).length || 0;
};

const formatCurrency = (value) => `Q${Number(value || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;

const StatIcon = ({ path }) => (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-600">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
        </svg>
    </span>
);

export const AdminDashboard = () => {
    const userRole = useAuthStore((state) => state.user?.role);
    const isSuperAdmin = userRole === "ADMIN_ROLE";
    const [stats, setStats] = useState({
        orders: 0,
        restaurants: 0,
        users: 0,
        revenue: 0,
        menus: 0,
        reviews: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [restaurantsRes, menusRes, reviewsRes, ordersRes, usersRes] = await Promise.allSettled([
                getRestaurants({ isActive: true }),
                getMenus({ isActive: true }),
                getReviews(),
                getOrders(),
                isSuperAdmin ? getUsers() : Promise.resolve({ data: [] }),
            ]);

            const orders = ordersRes.status === "fulfilled" ? getItems(ordersRes, "pedidos") : [];
            const users = usersRes.status === "fulfilled" ? getItems(usersRes, "users") : [];

            setStats({
                orders: getCount(ordersRes, "pedidos"),
                restaurants: getCount(restaurantsRes, "restaurantes"),
                users: users.length || getCount(usersRes, "users"),
                revenue: orders.reduce((sum, order) => sum + Number(order.total ?? order.totalPedido ?? 0), 0),
                menus: getCount(menusRes, "menus"),
                reviews: getCount(reviewsRes, "resenas"),
            });
            setRecentOrders(orders.slice(0, 6));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStats();
    }, []);

    const statCards = useMemo(() => [
        { label: "Total pedidos", value: stats.orders, icon: "M9 5h6m-8 4h10m-11 4h12m-9 4h6M5 3h14v18H5z" },
        { label: "Restaurantes", value: stats.restaurants, icon: "M4 10h16M6 10v10h12V10M8 10V7a4 4 0 0 1 8 0v3" },
        ...(isSuperAdmin ? [{ label: "Usuarios", value: stats.users, icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" }] : []),
        { label: "Ingresos", value: formatCurrency(stats.revenue), icon: "M12 8c-2.5 0-4 1.2-4 3s1.5 3 4 3 4 1.2 4 3-1.5 3-4 3m0-12V5m0 16v-3" },
    ], [isSuperAdmin, stats]);

    const columns = [
        {
            key: "numeroPedido",
            header: "Pedido",
            render: (row) => `#${row.numeroPedido || row._id?.slice(-6) || row.id?.slice(-6) || "N/A"}`,
        },
        {
            key: "cliente",
            header: "Cliente",
            render: (row) => row.usuario?.nombre || row.usuario?.id || row.cliente || "N/A",
        },
        {
            key: "restaurante",
            header: "Restaurante",
            render: (row) => row.restaurante?.nombre || row.restaurante?.id || row.restaurante || "N/A",
        },
        {
            key: "estado",
            header: "Estado",
            render: (row) => <OrderStatus status={row.estado || row.estadoPedido || "Pendiente"} />,
        },
        {
            key: "total",
            header: "Total",
            render: (row) => formatCurrency(row.total ?? row.totalPedido),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className={adminTheme.pageTitle}>Dashboard</h2>
                    <p className="mt-1 text-sm text-slate-600">Resumen operativo de pedidos, restaurantes y ventas.</p>
                </div>
                <button type="button" onClick={fetchStats} className={adminTheme.primaryButton}>
                    {loading ? "Actualizando..." : "Actualizar datos"}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => (
                    <Card key={item.label}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">{item.label}</p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : item.value}</p>
                            </div>
                            <StatIcon path={item.icon} />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    ["Menus publicados", stats.menus, "/admin/menus"],
                    ["Resenas recientes", stats.reviews, "/admin/reviews"],
                    ["Reportes", "Ver metricas", "/admin/reports"],
                ].map(([label, value, to]) => (
                    <Link key={label} to={to} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40">
                        <p className="text-sm font-semibold text-slate-900">{label}</p>
                        <p className="mt-2 text-sm text-slate-500">{value}</p>
                    </Link>
                ))}
            </div>

            <Card title="Pedidos recientes">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-200" />
                        ))}
                    </div>
                ) : (
                    <DataTable columns={columns} rows={recentOrders} rowKey="_id" emptyLabel="No hay pedidos recientes" />
                )}
            </Card>
        </div>
    );
};
