import { Armchair, UsersRound } from "lucide-react";

export const TableGrid = ({ tables = [], loading = false, onTableClick = null }) => {
    const getTableStatus = (table, reservations = []) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hasReservation = reservations.some((res) => {
            const resDate = new Date(res.fecha);
            resDate.setHours(0, 0, 0, 0);
            return res.mesa?._id === table._id && resDate.getTime() === today.getTime();
        });

        if (hasReservation) return "reserved";
        if (!table.disponibilidad) return "occupied";
        return "available";
    };

    const getStatusColor = (status) => {
        const colors = {
            available: {
                card: "border-emerald-200 bg-emerald-50/70",
                badge: "bg-emerald-100 text-emerald-800",
                dot: "bg-emerald-500",
            },
            occupied: {
                card: "border-rose-200 bg-rose-50/70",
                badge: "bg-rose-100 text-rose-800",
                dot: "bg-rose-500",
            },
            reserved: {
                card: "border-amber-200 bg-amber-50/80",
                badge: "bg-amber-100 text-amber-800",
                dot: "bg-amber-500",
            },
        };
        return colors[status] || colors.available;
    };

    const getStatusLabel = (status) => {
        const labels = {
            available: "Disponible",
            occupied: "Ocupada",
            reserved: "Reservada",
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.72)]"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                <LegendItem className="bg-emerald-500" label="Disponible" />
                <LegendItem className="bg-rose-500" label="Ocupada" />
                <LegendItem className="bg-amber-500" label="Reservada" />
            </div>

            {tables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                    <p className="text-sm font-bold text-slate-500">No hay mesas disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {tables.map((table) => {
                        const status = getTableStatus(table);
                        const colors = getStatusColor(status);
                        const isClickable = onTableClick && status === "available";

                        return (
                            <button
                                key={table._id || table.id}
                                type="button"
                                onClick={() => isClickable && onTableClick(table)}
                                className={`
                                    rounded-2xl border p-4 text-left shadow-sm transition
                                    ${colors.card}
                                    ${isClickable ? "hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white hover:shadow-xl" : ""}
                                `}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
                                        <Armchair size={20} />
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${colors.badge}`}>
                                        {getStatusLabel(status)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                                        <h3 className="text-lg font-black text-slate-950">
                                            Mesa {table.numeroMesa}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2">
                                        <UsersRound size={15} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">
                                            {table.capacidad} personas
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const LegendItem = ({ className, label }) => (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
        <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
        <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
    </div>
);
