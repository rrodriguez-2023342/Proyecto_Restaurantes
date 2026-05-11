import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { showError } from "../../../shared/utils/toast";

// Importación de imágenes para el carrusel
import res1 from "../../../assets/images/Restaurante1.webp";
import res2 from "../../../assets/images/Restaurante2.jpg";
import res3 from "../../../assets/images/Restaurante3.jpg";
import res4 from "../../../assets/images/Restaurante4.jpg";
import res5 from "../../../assets/images/Restaurante5.jpg";

const heroImages = [res1, res2, res3, res4, res5];

export const UserHome = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        fetchRestaurants();
    }, []);

    // Lógica del carrusel automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const categories = useMemo(() => {
        const rawCategories = Array.from(
            new Set(restaurants.map((item) => item?.categoria).filter(Boolean))
        );
        return ["Todos", ...rawCategories];
    }, [restaurants]);

    const filtered = useMemo(() => {
        return restaurants.filter((restaurant) => {
            const name = restaurant?.nombre || "";
            const description = restaurant?.descripcion || "";
            const matchesQuery =
                name.toLowerCase().includes(query.toLowerCase()) ||
                description.toLowerCase().includes(query.toLowerCase());
            
            const matchesCategory = selectedCategory === "Todos"
                ? true
                : restaurant?.categoria?.toLowerCase() === selectedCategory.toLowerCase();
                
            return matchesQuery && matchesCategory;
        });
    }, [restaurants, query, selectedCategory]);

    const categoryIcons = {
        "Todos": "🍽️",
        "Pizza": "🍕",
        "Hamburguesas": "🍔",
        "Italiana": "🍝",
        "China": "🥡",
        "Postres": "🍰",
        "Bebidas": "🥤",
        "Mexicana": "🌮",
        "Sushi": "🍣",
    };

    return (
        <div className="space-y-8 md:space-y-12 pb-12">
            {/* Hero Section con Carrusel */}
            <section className="relative overflow-hidden rounded-3xl md:rounded-[3rem] bg-slate-900 px-6 py-12 md:px-12 md:py-24 shadow-2xl min-h-[400px] flex items-center justify-center">
                {/* Carrusel de Imágenes */}
                {heroImages.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            idx === currentImageIndex ? "opacity-40" : "opacity-0"
                        }`}
                    >
                        <img
                            src={img}
                            alt={`Restaurante ${idx + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ))}

                {/* Overlay de Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <span className="mb-4 inline-block rounded-full bg-orange-500/30 px-4 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-orange-300 backdrop-blur-sm border border-orange-500/20">
                        Los mejores sabores cerca de ti
                    </span>
                    <h2 className="mb-4 text-3xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
                        Descubre tu nueva <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                            comida favorita
                        </span>
                    </h2>
                    <p className="mb-8 max-w-2xl mx-auto text-sm md:text-lg text-slate-300 font-medium">
                        Explora la mejor selección de restaurantes y pide lo que más te gusta en segundos.
                    </p>

                    {/* Barra de Búsqueda Minimalista */}
                    <div className="relative group mx-auto max-w-lg">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-20 blur-md transition duration-1000 group-hover:opacity-40" />
                        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-xl transition-all duration-300 focus-within:bg-white/20">
                            <div className="pl-4 pr-2">
                                <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="¿Qué se te antoja hoy?..."
                                className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none font-medium"
                            />
                            <button className="hidden sm:flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-2.5 text-xs font-black text-white transition-all duration-300 hover:bg-orange-400 active:scale-95">
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categorías Carousel - Totalmente Responsive */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Categorías Populares</h3>
                    <button onClick={fetchRestaurants} className="text-xs font-bold text-orange-500 hover:underline">
                        Ver todo
                    </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex min-w-max items-center gap-2 rounded-2xl border px-5 py-3 transition-all duration-300 ${
                                selectedCategory === cat
                                    ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200"
                                    : "border-slate-100 bg-white text-slate-600 hover:border-orange-200"
                            }`}
                        >
                            <span className="text-lg md:text-xl">{categoryIcons[cat] || "🍲"}</span>
                            <span className="text-xs md:text-sm font-bold">{cat}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid de Restaurantes - Adaptable a móviles */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">
                        {query || selectedCategory !== "Todos" ? "Resultados" : "Restaurantes Cerca"}
                    </h3>
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} opciones</span>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 md:h-80 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                ) : filtered.length ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((restaurant) => (
                            <Link 
                                key={restaurant?._id || restaurant?.id}
                                to={`/home/restaurants/${restaurant?._id || restaurant?.id}`}
                                className="group"
                            >
                                <div className="overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:shadow-2xl border border-slate-100">
                                    <div className="relative h-40 md:h-48 overflow-hidden">
                                        {restaurant?.fotos ? (
                                            <img
                                                src={restaurant.fotos}
                                                alt={restaurant?.nombre}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                                <span className="text-3xl">🍴</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-900 backdrop-blur-sm shadow-sm">
                                                {restaurant?.categoria || "General"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="font-bold text-slate-900 group-hover:text-orange-500 transition-colors">
                                                {restaurant?.nombre}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold text-orange-500">★</span>
                                                <span className="text-xs font-bold text-slate-900">4.8</span>
                                            </div>
                                        </div>
                                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                                            {restaurant?.descripcion || "Experiencia gastronómica única."}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No hay resultados"
                        description="Intenta cambiar tu búsqueda o categoría."
                        actionLabel="Ver todos"
                        onAction={() => { setQuery(""); setSelectedCategory("Todos"); }}
                    />
                )}
            </section>
        </div>
    );
};


