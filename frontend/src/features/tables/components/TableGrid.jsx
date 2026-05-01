export const TableGrid = ({ tables = [], loading = false, onTableClick = null }) => {
    const getTableStatus = (table, reservations = []) => {
        // Check if table has a reservation today
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
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                badge: "bg-emerald-100 text-emerald-800",
                dot: "bg-emerald-500",
            },
            occupied: {
                bg: "bg-red-50",
                border: "border-red-200",
                badge: "bg-red-100 text-red-800",
                dot: "bg-red-500",
            },
            reserved: {
                bg: "bg-amber-50",
                border: "border-amber-200",
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 bg-slate-200 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-slate-600">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-600">Reservada</span>
                </div>
            </div>

            {/* Grid */}
            {tables.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">No hay mesas disponibles</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tables.map((table) => {
                        const status = getTableStatus(table);
                        const colors = getStatusColor(status);
                        const isClickable = onTableClick && status === "available";

                        return (
                            <div
                                key={table._id || table.id}
                                onClick={() => isClickable && onTableClick(table)}
                                className={`
                                    p-4 rounded-lg border-2 transition
                                    ${colors.bg} ${colors.border}
                                    ${isClickable ? "cursor-pointer hover:shadow-lg transform hover:scale-105" : ""}
                                `}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                                        <h3 className="font-semibold text-slate-900">
                                            Mesa {table.numeroMesa}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Capacidad:</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {table.capacidad} personas
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                            className={`
                                                inline-block px-2 py-1 rounded text-xs font-medium
                                                ${colors.badge}
                                            `}
                                        >
                                            {getStatusLabel(status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
