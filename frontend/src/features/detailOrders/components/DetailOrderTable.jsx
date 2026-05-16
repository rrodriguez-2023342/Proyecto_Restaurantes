import { DataTable, Card } from "../../../shared/components";
import { adminTheme } from "../../../constants/theme";

export const DetailOrderTable = ({ items = [], onEdit, onDelete, loading }) => {
    const columns = [
        {
            key: "numeroPedido",
            header: "Pedido",
            render: (row) =>
                `#${row.pedido?.numeroPedido || row.pedido?._id?.slice(-6) || row.pedido?.id?.slice(-6) || row.numeroPedido || "N/A"}`,
        },
        {
            key: "plato",
            header: "Plato",
            render: (row) => row.plato?.nombre || row.nombrePlato || "N/A",
        },
        {
            key: "cantidad",
            header: "Cantidad",
        },
        {
            key: "precioUnitario",
            header: "Precio Unitario",
            render: (row) => `$${(row.precioUnitario || 0).toFixed(2)}`,
        },
        {
            key: "subtotal",
            header: "Subtotal",
            render: (row) => {
                const sub = row.subtotal || row.cantidad * row.precioUnitario;
                return `$${sub.toFixed(2)}`;
            },
        },
        {
            key: "acciones",
            header: "Acciones",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit?.(row)}
                        className={adminTheme.outlineButton}
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => {
                            if (confirm("¿Eliminar este artículo?")) {
                                onDelete?.(row.detailOrderId || row._id || row.id);
                            }
                        }}
                        className={adminTheme.destructiveButton}
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <Card title="Detalles de Pedidos">
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200" />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card title="Detalles de Pedidos">
            <DataTable
                columns={columns}
                rows={items}
                rowKey="_id"
                emptyLabel="No hay detalles de pedidos"
            />
        </Card>
    );
};
