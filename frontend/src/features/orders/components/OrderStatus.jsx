const ORDER_STATUS_STYLES = {
    pendiente: "bg-amber-100 text-amber-700",
    confirmado: "bg-emerald-100 text-emerald-700",
    "en preparacion": "bg-amber-100 text-amber-700",
    en_preparacion: "bg-amber-100 text-amber-700",
    "listo para entrega": "bg-blue-100 text-blue-700",
    listo: "bg-blue-100 text-blue-700",
    entregado: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-rose-100 text-rose-700",
};

const normalizeStatus = (status) =>
    String(status || "Pendiente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/_/g, " ")
        .trim();

export const OrderStatus = ({ status = "Pendiente" }) => {
    const key = normalizeStatus(status);
    const compactKey = key.replace(/ /g, "_");
    const classes = ORDER_STATUS_STYLES[key] || ORDER_STATUS_STYLES[compactKey] || "bg-slate-200 text-slate-600";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
            {status}
        </span>
    );
};