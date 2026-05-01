import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, DataTable } from "../../../shared/components";
import { useOrderStore } from "../store/useOrderStore";
import { useAuthStore } from "../../auth/store/authStore";
import { OrderStatus } from "../components/OrderStatus.jsx";

export const UserOrdersPage = () => {
    const navigate = useNavigate();
    const { orders, loading, fetchOrders } = useOrderStore();
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filtrar pedidos del usuario actual
    const userOrders = orders.filter(
        (order) => order.usuario?._id === user?.id || order.usuario?.id === user?.id
    );

    const columns = [
        {
            key: "numeroPedido",
            header: "Número de Pedido",
            render: (row) => `#${row.numeroPedido || row.id?.slice(-6)}`,
        },
        {
            key: "restaurante",
            header: "Restaurante",
            render: (row) => row.restaurante?.nombre || "N/A",
        },
        {
            key: "total",
            header: "Total",
            render: (row) => `$${(row.total || 0).toFixed(2)}`,
        },
        {
            key: "estado",
            header: "Estado",
            render: (row) => <OrderStatus status={row.estado || "pendiente"} />,
        },
        {
            key: "fecha",
            header: "Fecha",
            render: (row) =>
                new Date(row.fechaPedido || row.createdAt).toLocaleDateString("es-ES"),
        },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => (
                <button
                    onClick={() => navigate(`/home/orders/${row._id || row.id}`)}
                    className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition"
                >
                    Ver Detalle
                </button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Pedidos</h1>
                    <p className="mt-1 text-slate-600">
                        Historial de pedidos realizados
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">
                                {userOrders.length}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Total de Pedidos</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">
                                {userOrders.filter(o => o.estado === "pendiente" || o.estado === "en preparación").length}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">En Proceso</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-900">
                                ${userOrders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">Gasto Total</p>
                        </div>
                    </Card>
                </div>

                {/* Table */}
                <Card title="Historial de Pedidos">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 animate-pulse rounded-lg bg-slate-200"
                                />
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            rows={userOrders}
                            rowKey="_id"
                            emptyLabel="No tienes pedidos aún"
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};
