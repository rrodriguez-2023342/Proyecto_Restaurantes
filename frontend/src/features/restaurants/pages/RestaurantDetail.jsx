import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRestaurantById } from "../../../shared/api";
import { Card, EmptyState } from "../../../shared/components";
import { showError } from "../../../shared/utils/toast";

export const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const { data } = await getRestaurantById(id);
                setRestaurant(data?.restaurante || data);
            } catch (err) {
                console.error(err);
                showError("No se pudo cargar el restaurante");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <Card>
                <p className="text-sm text-slate-500">Cargando restaurante...</p>
            </Card>
        );
    }

    if (!restaurant) {
        return (
            <EmptyState
                title="Restaurante no encontrado"
                description="Verifica el enlace o vuelve al listado."
                actionLabel="Volver"
                onAction={() => window.history.back()}
            />
        );
    }

    return (
        <div className="space-y-6">
            <Card title={restaurant?.nombre}>
                    {restaurant?.fotos ? (
                        <img
                            src={restaurant.fotos}
                            alt={restaurant?.nombre}
                            className="mb-4 h-48 w-full rounded-2xl object-cover"
                        />
                    ) : null}
                <p className="text-sm text-slate-600">
                    {restaurant?.descripcion || "Sin descripcion"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        {restaurant?.categoria || "Categoria"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        {restaurant?.direccion?.ciudad || "Ciudad"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                        {restaurant?.telefono || "Telefono"}
                    </span>
                </div>
            </Card>

            <Link to="/home" className="text-xs font-semibold text-orange-600">
                Volver al listado
            </Link>
        </div>
    );
};
