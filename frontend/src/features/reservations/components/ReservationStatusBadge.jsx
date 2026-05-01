import { Badge } from "@material-tailwind/react";

export const ReservationStatusBadge = ({ status }) => {
    const statusStyles = {
        PENDIENTE: "bg-yellow-100 text-yellow-800",
        CONFIRMADA: "bg-green-100 text-green-800",
        COMPLETADA: "bg-blue-100 text-blue-800",
        CANCELADA: "bg-red-100 text-red-800",
    };

    const statusLabels = {
        PENDIENTE: "Pendiente",
        CONFIRMADA: "Confirmada",
        COMPLETADA: "Completada",
        CANCELADA: "Cancelada",
    };

    return (
        <Badge className={`${statusStyles[status] || "bg-slate-100 text-slate-800"} text-xs py-1.5`}>
            {statusLabels[status] || status}
        </Badge>
    );
};
