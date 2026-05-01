import { Card } from "../../../shared/components";

export const Cart = ({ 
    items = [], 
    onUpdateQuantity, 
    onRemoveItem, 
    subtotal = 0,
    tax = 0,
    total = 0,
    isEditable = true,
    loading = false 
}) => {
    if (loading) {
        return (
            <Card title="Carrito de Compras">
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse bg-slate-200 rounded" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!items.length) {
        return (
            <Card title="Carrito de Compras">
                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                    <p className="text-sm text-slate-500">El carrito está vacío</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Carrito de Compras">
            <div className="space-y-3 mb-4">
                {items.map((item) => (
                    <div
                        key={item._id || item.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200"
                    >
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                {item.plato?.nombre || item.nombrePlato}
                            </p>
                            <p className="text-xs text-slate-500">
                                ${(item.precioUnitario || item.precio)?.toFixed(2)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditable && (
                                <>
                                    <button
                                        onClick={() =>
                                            onUpdateQuantity?.(
                                                item._id || item.id,
                                                Math.max(1, item.cantidad - 1)
                                            )
                                        }
                                        className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center text-sm font-semibold">
                                        {item.cantidad}
                                    </span>
                                    <button
                                        onClick={() =>
                                            onUpdateQuantity?.(
                                                item._id || item.id,
                                                item.cantidad + 1
                                            )
                                        }
                                        className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
                                    >
                                        +
                                    </button>
                                </>
                            )}
                            {!isEditable && (
                                <span className="text-sm font-semibold text-slate-700">
                                    {item.cantidad}
                                </span>
                            )}
                        </div>

                        <div className="w-20 text-right">
                            <p className="text-sm font-semibold text-slate-900">
                                ${(item.subtotal || item.cantidad * item.precioUnitario || item.cantidad * item.precio)?.toFixed(2)}
                            </p>
                        </div>

                        {isEditable && (
                            <button
                                onClick={() => onRemoveItem?.(item._id || item.id)}
                                className="ml-2 rounded-lg bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impuesto:</span>
                    <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
                    <span className="text-slate-900">Total:</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
};
