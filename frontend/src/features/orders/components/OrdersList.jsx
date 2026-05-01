import { OrderStatus } from "./OrderStatus.jsx";
import { Card } from "../../../shared/components";

export const OrdersList = ({ orders = [], onSelectOrder, selectedId, loading }) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-20 animate-pulse rounded-lg bg-slate-200"
                    />
                ))}
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                <p className="text-sm text-slate-500">No hay pedidos disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <Card
                    key={order._id || order.id}
                    className={`cursor-pointer transition-all ${
                        selectedId === (order._id || order.id)
                            ? "border-orange-400 bg-orange-50/50"
                            : "hover:border-orange-200"
                    }`}
                    accent={selectedId === (order._id || order.id)}
                    onClick={() => onSelectOrder?.(order)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                Pedido #{order.numeroPedido || order.id?.slice(-6)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(order.fechaPedido || order.createdAt).toLocaleDateString("es-ES")}
                            </p>
                            <p className="text-xs text-slate-600 mt-2 font-medium">
                                Total: <span className="text-orange-600">${order.total?.toFixed(2) || "0.00"}</span>
                            </p>
                        </div>
                        <OrderStatus status={order.estado || "pendiente"} />
                    </div>
                </Card>
            ))}
        </div>
    );
};
