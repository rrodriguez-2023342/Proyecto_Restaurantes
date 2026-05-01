const ORDER_STATUS_STYLES = {
    pendiente: "bg-amber-100 text-amber-700",
    confirmado: "bg-emerald-100 text-emerald-700",
    "en preparación": "bg-amber-100 text-amber-700",
    "en_preparacion": "bg-amber-100 text-amber-700",
    listo: "bg-emerald-100 text-emerald-700",
    entregado: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-rose-100 text-rose-700",
};

export const OrderStatus = ({ status = "pendiente" }) => {
    const key = status?.toLowerCase?.() || "pendiente";
    const normalizedKey = key.replace(/ /g, "_");
    const classes = ORDER_STATUS_STYLES[key] || ORDER_STATUS_STYLES[normalizedKey] || "bg-slate-200 text-slate-600";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
            {status}
        </span>
    );
};
