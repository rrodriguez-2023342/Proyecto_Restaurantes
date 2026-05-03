const STATUS_STYLES = {
    activo: "bg-emerald-100 text-emerald-700",
    inactivo: "bg-slate-100 text-slate-700",
    pendiente: "bg-amber-100 text-amber-700",
    aprobado: "bg-emerald-100 text-emerald-700",
    rechazado: "bg-rose-100 text-rose-700",
    cancelado: "bg-rose-100 text-rose-700",
    entregado: "bg-emerald-100 text-emerald-700",
    "en preparacion": "bg-blue-100 text-blue-700",
    "en progreso": "bg-blue-100 text-blue-700",
    admin_role: "bg-orange-100 text-orange-700",
    admin_restaurant_role: "bg-blue-100 text-blue-700",
    user_role: "bg-slate-100 text-slate-700",
};

export const BadgeEstado = ({ value = "activo" }) => {
    const key = value?.toLowerCase?.() || "activo";
    const classes = STATUS_STYLES[key] || "bg-slate-200 text-slate-600";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
            {value}
        </span>
    );
};
