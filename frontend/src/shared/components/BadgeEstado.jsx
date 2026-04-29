const STATUS_STYLES = {
    activo: "bg-emerald-100 text-emerald-700",
    inactivo: "bg-slate-200 text-slate-600",
    pendiente: "bg-amber-100 text-amber-700",
    aprobado: "bg-emerald-100 text-emerald-700",
    rechazado: "bg-rose-100 text-rose-700",
};

export const BadgeEstado = ({ value = "activo" }) => {
    const key = value?.toLowerCase?.() || "activo";
    const classes = STATUS_STYLES[key] || "bg-slate-200 text-slate-600";

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
            {value}
        </span>
    );
};
