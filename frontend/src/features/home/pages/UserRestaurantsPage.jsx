import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, ChevronRight, Utensils, Pizza, Coffee, Dessert, Soup, Sandwich, Fish, IceCream, Flame, ArrowRight, Sparkles, ChefHat, Timer, Zap, TrendingUp, DollarSign, Users } from "lucide-react";
import { EmptyState } from "../../../shared/components";
import { getRestaurants } from "../../../shared/api";
import { showError } from "../../../shared/utils/toast";

// Imágenes de comida para fondo
import comida1 from "../../../assets/images/comida1.png";
import comida2 from "../../../assets/images/comida2.png";
import comida3 from "../../../assets/images/comida3.png";
import comida4 from "../../../assets/images/comida4.png";
import comida5 from "../../../assets/images/comida5.png";
import comida6 from "../../../assets/images/comida6.png";
import comida7 from "../../../assets/images/comida7.png";
import comida8 from "../../../assets/images/comida8.png";
import comida9 from "../../../assets/images/comida9.png";
import comida10 from "../../../assets/images/comida10.png";

const categoryIcons = {
    "Todos": <Utensils size={14} />,
    "Pizza": <Pizza size={14} />,
    "Hamburguesas": <Sandwich size={14} />,
    "Italiana": <Soup size={14} />,
    "China": <ChefHat size={14} />,
    "Postres": <Dessert size={14} />,
    "Bebidas": <Coffee size={14} />,
    "Mexicana": <Flame size={14} />,
    "Sushi": <Fish size={14} />,
    "Helados": <IceCream size={14} />,
};

const FloatingDish = ({ src, delay, duration, size, top, left, rotate, opacity = 0.3 }) => (
    <div 
        className="absolute pointer-events-none select-none animate-float z-0"
        style={{
            top: `${top}px`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            transform: `rotate(${rotate}deg)`,
            opacity: opacity,
        }}
    >
        <img src={src} alt="" className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)]" />
    </div>
);

export const UserRestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todos");

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
            const matchesCategory =
                selectedCategory === "Todos"
                    ? true
                    : restaurant?.categoria?.toLowerCase() === selectedCategory.toLowerCase();
            return matchesQuery && matchesCategory;
        });
    }, [restaurants, query, selectedCategory]);

    const getCount = (cat) => {
        if (cat === "Todos") return restaurants.length;
        return restaurants.filter(r => r.categoria?.toLowerCase() === cat.toLowerCase()).length;
    };

    const peopleFavorites = useMemo(() => filtered.slice(0, 4), [filtered]);

    return (
        <div className="w-full bg-[#fcfcfc] min-h-screen relative overflow-x-hidden font-sans">
            
            {/* ── PROFESSIONAL HERO ── */}
            <section className="relative h-[480px] bg-[#050505] overflow-hidden flex flex-col justify-center border-b border-amber-500/10">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10" />
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <FloatingDish src={comida1} size={350} top={-20} left={75} delay={0} duration={25} rotate={15} opacity={0.3} />
                    <FloatingDish src={comida3} size={400} top={120} left={-5} delay={5} duration={30} rotate={-10} opacity={0.3} />
                    <FloatingDish src={comida9} size={220} top={250} left={85} delay={3} duration={22} rotate={20} opacity={0.3} />
                </div>
                
                <div className="relative z-10 w-full max-w-[1400px] mx-auto px-12 lg:px-20">
                    <div className="max-w-4xl space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-8 bg-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-amber-500">KinalEats Discovery</span>
                        </div>
                        
                        <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tight leading-none uppercase">
                            Universo<br />
                            <span className="italic font-light text-amber-500">Gourmet.</span>
                        </h2>

                        <div className="relative group max-w-xl">
                            <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 focus-within:border-amber-500/50 focus-within:bg-white/10">
                                <div className="pl-6 pr-4 text-amber-500">
                                    <Search size={22} strokeWidth={2.5} />
                                </div>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="¿Qué restaurante buscas hoy?"
                                    className="flex-1 bg-transparent py-5 text-white placeholder:text-slate-500 focus:outline-none font-medium text-lg"
                                />
                                <div className="pr-2">
                                    <button className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTENT AREA ── */}
            <div className="max-w-[1500px] mx-auto px-12 lg:px-20 space-y-32 pt-24 pb-40 relative z-10">
                
                {/* ── CATEGORIES: THE BOUTIQUE MENU (Editorial Update) ── */}
                <section className="relative">
                    <div className="grid lg:grid-cols-[280px_1fr] gap-16 items-center">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-amber-600">
                                <Utensils size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Carta de Sabores</span>
                            </div>
                            <h3 className="text-4xl font-bold text-slate-900 leading-tight uppercase tracking-tighter">
                                Explora por <br /> <span className="italic font-light text-slate-400">Concepto</span>
                            </h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px]">
                                Selecciona una categoría para filtrar nuestra red de destinos culinarios elite.
                            </p>
                        </div>

                        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 ${
                                            selectedCategory === cat 
                                                ? "bg-slate-950 text-white shadow-xl translate-y-[-2px]" 
                                                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <span className={`transition-transform duration-500 ${selectedCategory === cat ? "scale-110 text-amber-500" : "group-hover:scale-110"}`}>
                                            {categoryIcons[cat] || <Utensils size={14} />}
                                        </span>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat}</span>
                                            <span className={`text-[8px] font-bold opacity-40 ${selectedCategory === cat ? "text-amber-500" : ""}`}>
                                                {getCount(cat)} locales
                                            </span>
                                        </div>
                                        {selectedCategory === cat && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 bg-amber-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAVORITOS DE LA GENTE ── */}
                {selectedCategory === "Todos" && (
                    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
                                    <Users size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Favoritos de la Gente</h3>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Destinos con mayor calificación</span>
                                </div>
                            </div>
                            <Link to="#" className="p-3 rounded-full border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-500 transition-all">
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                        
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {peopleFavorites.map((restaurant) => (
                                <Link 
                                    key={`fav-${restaurant.id}`} 
                                    to={`/home/restaurants/${restaurant.id}`}
                                    className="group relative h-[250px] rounded-[2rem] overflow-hidden shadow-lg transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border border-slate-50"
                                >
                                    <img src={restaurant.fotos} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6 space-y-2">
                                        <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full w-fit shadow-lg">
                                            <Star size={10} fill="currentColor" />
                                            <span className="text-[10px] font-black italic">4.9</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-white uppercase tracking-tight leading-tight">{restaurant.nombre}</h4>
                                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.3em]">{restaurant.categoria}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── MAIN DIRECTORY ── */}
                <section className="space-y-16">
                    <div className="flex items-center justify-between border-b-2 border-slate-950 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-3 w-3 bg-amber-500 rotate-45" />
                            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">Directorio General</h3>
                        </div>
                        <div className="flex gap-3">
                             <div className="bg-white border border-slate-100 p-3 rounded-xl hover:border-amber-500 cursor-pointer transition-all shadow-sm"><Filter size={20} /></div>
                             <div className="bg-white border border-slate-100 p-3 rounded-xl hover:border-amber-500 cursor-pointer transition-all shadow-sm"><TrendingUp size={20} /></div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="aspect-video w-full animate-pulse bg-slate-100 rounded-[2rem]" />
                            ))}
                        </div>
                    ) : filtered.length ? (
                        <div className="grid gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((restaurant) => (
                                <Link
                                    key={restaurant?._id || restaurant?.id}
                                    to={`/home/restaurants/${restaurant?._id || restaurant?.id}`}
                                    className="group block"
                                >
                                    <div className="space-y-8">
                                        <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-slate-100 transition-all duration-700 group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-50">
                                            <img
                                                src={restaurant.fotos || comida1}
                                                alt={restaurant.nombre}
                                                className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                                            />
                                            <div className="absolute top-6 left-6">
                                                <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl px-5 py-2 shadow-sm flex items-center gap-2">
                                                    <Clock size={14} className="text-amber-600" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">30 min</span>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 right-6">
                                                <div className="bg-slate-900 text-white h-14 w-14 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
                                                    <ArrowRight size={24} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 px-2">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1.5">
                                                    <h4 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase group-hover:text-amber-600 transition-colors leading-none">
                                                        {restaurant.nombre}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                                                        <MapPin size={14} className="text-amber-500" /> {restaurant.direccion?.ciudad || "Guatemala"}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                                    <Star size={14} fill="#f59e0b" className="text-amber-500" />
                                                    <span className="text-lg font-black text-slate-950 italic">4.8</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-[14px] leading-relaxed text-slate-500 font-medium line-clamp-2">
                                                {restaurant.description || "Curaduría gastronómica de primer nivel enfocada en la excelencia y el sabor local."}
                                            </p>

                                            <div className="flex items-center gap-5 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.4em]">{restaurant.categoria || "Gourmet"}</span>
                                                </div>
                                                <div className="h-[1px] flex-1 bg-slate-50" />
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    <DollarSign size={12} className="text-slate-200" /> $$$
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center">
                            <EmptyState title="Sin resultados" description="Nuestra red elite aún no llega a esta categoría." />
                        </div>
                    )}
                </section>
            </div>
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingDish src={comida7} size={400} top={800} left={88} delay={0} duration={40} rotate={12} opacity={0.2} />
                <FloatingDish src={comida5} size={300} top={2400} left={2} delay={6} duration={45} rotate={25} opacity={0.2} />
            </div>

            <div className="h-40" />
        </div>
    );
};
