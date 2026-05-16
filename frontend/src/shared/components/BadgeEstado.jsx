const STATUS_STYLES = {
    activo: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    inactivo: "bg-slate-100 text-slate-700 ring-slate-600/15",
    pendiente: "bg-amber-50 text-amber-700 ring-amber-600/25",
    aprobado: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    rechazado: "bg-rose-50 text-rose-700 ring-rose-600/20",
    cancelado: "bg-rose-50 text-rose-700 ring-rose-600/20",
    entregado: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    "en preparacion": "bg-amber-50 text-amber-700 ring-amber-600/25",
    "en progreso": "bg-amber-50 text-amber-700 ring-amber-600/25",
    admin_role: "bg-slate-950 text-amber-300 ring-slate-950/20",
    admin_restaurant_role: "bg-amber-50 text-amber-700 ring-amber-600/25",
    user_role: "bg-slate-100 text-slate-700 ring-slate-600/15",
};

export const BadgeEstado = ({ value = "activo" }) => {
    const key = value?.toLowerCase?.() || "activo";
    const classes = STATUS_STYLES[key] || "bg-slate-100 text-slate-700 ring-slate-600/15";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ring-1 ${classes}`}>
            {value}
        </span>
    );
};
