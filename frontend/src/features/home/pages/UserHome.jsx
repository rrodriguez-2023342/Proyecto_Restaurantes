import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { showError } from "../../../shared/utils/toast";

export const UserHome = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");

    const fetchRestaurants = async () => {
        try {
            setIsLoading(true);
            const { data } = await getRestaurants();
            setRestaurants(data?.data || data?.restaurantes || data || []);
        } catch (err) {
            console.error(err);
            showError("No se pudieron cargar los restaurantes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchRestaurants();
    }, []);

    const filtered = useMemo(() => {
        return restaurants.filter((restaurant) => {
            const name = restaurant?.nombre || "";
            const description = restaurant?.descripcion || "";
            const matchesQuery =
                name.toLowerCase().includes(query.toLowerCase()) ||
                description.toLowerCase().includes(query.toLowerCase());
            const matchesCity = city
                ? restaurant?.direccion?.ciudad?.toLowerCase() === city.toLowerCase()
                : true;
            const matchesCategory = category
                ? restaurant?.categoria?.toLowerCase() === category.toLowerCase()
                : true;
            return matchesQuery && matchesCity && matchesCategory;
        });
    }, [restaurants, query, city, category]);

    const cities = useMemo(() => {
        return Array.from(
            new Set(restaurants.map((item) => item?.direccion?.ciudad).filter(Boolean))
        );
    }, [restaurants]);

    const categories = useMemo(() => {
        return Array.from(
            new Set(restaurants.map((item) => item?.categoria).filter(Boolean))
        );
    }, [restaurants]);

    const highlights = [
        "Recomendados",
        "Nuevos en la zona",
        "Top calificados",
    ];

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-white to-orange-50 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Explora y reserva
                        </p>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Encuentra tu proximo restaurante
                        </h2>
                        <p className="text-sm text-slate-600">
                            Filtra por ciudad, categoria o calificacion.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchRestaurants}
                        className="rounded-full border border-orange-200 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition"
                    >
                        Actualizar
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {highlights.map((item) => (
                        <span
                            key={item}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                        >
                            {item}
                        </span>
                    ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por nombre o descripcion"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                    <select
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Todas las ciudades</option>
                        {cities.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Todas las categorias</option>
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {isLoading ? (
                <Card>
                    <p className="text-sm text-slate-500">Cargando restaurantes...</p>
                </Card>
            ) : filtered.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((restaurant) => (
                        <Card
                            key={restaurant?._id || restaurant?.id}
                            title={restaurant?.nombre}
                            className="transition hover:-translate-y-1 hover:shadow-md"
                        >
                            {restaurant?.fotos ? (
                                <img
                                    src={restaurant.fotos}
                                    alt={restaurant?.nombre}
                                    className="mb-4 h-36 w-full rounded-2xl object-contain bg-slate-100"
                                />
                            ) : (
                                <div className="mb-4 h-36 w-full rounded-2xl bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
                            )}
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
                            </div>
                            <Link
                                to={`/home/restaurants/${restaurant?._id || restaurant?.id}`}
                                className="mt-4 inline-flex text-xs font-semibold text-orange-600 hover:text-orange-500"
                            >
                                Ver detalles
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No hay restaurantes disponibles"
                    description="Intenta ajustar los filtros o vuelve a cargar el listado."
                    actionLabel="Recargar"
                    onAction={fetchRestaurants}
                />
            )}
        </div>
    );
};
