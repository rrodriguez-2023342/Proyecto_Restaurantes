import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, Clock, MapPin, ChevronRight, Utensils, Pizza, Coffee, Dessert, Soup, Sandwich, Fish, IceCream, Flame, ArrowRight, Sparkles, ChefHat, Timer, Zap, TrendingUp, DollarSign, Users, Quote, Award, ShieldCheck } from "lucide-react";
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
    const [page, setPage] = useState(1);

    const PAGE_SIZE = 6;

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

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedRestaurants = useMemo(
        () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [filtered, currentPage]
    );

    const getCount = (cat) => {
        if (cat === "Todos") return restaurants.length;
        return restaurants.filter(r => r.categoria?.toLowerCase() === cat.toLowerCase()).length;
    };

    const handleQueryChange = (value) => {
        setQuery(value);
        setPage(1);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setPage(1);
    };

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
                        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
                    <div className="max-w-4xl space-y-6 md:space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-6 md:w-8 bg-amber-500" />
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] text-amber-500">KinalEats Discovery</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tight leading-none uppercase">
                            Universo<br />
                            <span className="italic font-light text-amber-500">Gourmet.</span>
                        </h2>
 
                        <div className="relative group max-w-xl">
                            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white/5 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 focus-within:border-amber-500/50 focus-within:bg-white/10 overflow-hidden">
                                <div className="flex items-center flex-1">
                                    <div className="pl-6 pr-4 text-amber-500">
                                        <Search size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        value={query}
                                        onChange={(e) => handleQueryChange(e.target.value)}
                                        placeholder="¿Qué restaurante buscas hoy?"
                                        className="flex-1 bg-transparent py-4 md:py-5 text-white placeholder:text-slate-500 focus:outline-none font-medium text-base md:text-lg w-full"
                                    />
                                </div>
                                <div className="p-2 sm:pr-2 sm:pl-0">
                                    <button className="w-full bg-amber-500 hover:bg-amber-600 text-black px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors">
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTENT AREA ── */}
            <div className="max-w-[1500px] mx-auto px-6 md:px-12 lg:px-20 space-y-20 md:space-y-32 pt-16 md:pt-24 pb-24 relative z-10">
                
                {/* ── CATEGORIES ── */}
                <section className="relative">
                    <div className="grid lg:grid-cols-[280px_1fr] gap-8 md:gap-16 items-center">
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 text-amber-600">
                                <Utensils size={16} />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Carta de Sabores</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight uppercase tracking-tighter">
                                Explora por <br /> <span className="italic font-light text-slate-400">Concepto</span>
                            </h3>
                        </div>

                        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
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
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── MAIN DIRECTORY ── */}
                <section className="space-y-16">
                    <div className="flex items-center justify-between border-b-2 border-slate-950 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-3 w-3 bg-amber-500 rotate-45" />
                            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">Directorio General</h3>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-8 md:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-video w-full animate-pulse bg-slate-100 rounded-[2rem]" />
                            ))}
                        </div>
                    ) : filtered.length ? (
                        <>
                        <div className="grid gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedRestaurants.map((restaurant) => (
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
                                                <div className="space-y-1.5 flex-1">
                                                    <h4 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tighter uppercase group-hover:text-amber-600 transition-colors leading-tight">
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
                        <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                Mostrando {(currentPage - 1) * PAGE_SIZE + 1} - {(currentPage - 1) * PAGE_SIZE + paginatedRestaurants.length} de {filtered.length}
                            </span>
                            <div className="flex w-full gap-2 sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="py-40 text-center">
                            <EmptyState title="Sin resultados" description="Nuestra red elite aún no llega a esta categoría." />
                        </div>
                    )}
                </section>
            </div>

            {/* ── THE KINAL PROMISE: MEDIUM SIZE & COMPACT ── */}
            <section className="relative w-full bg-[#050505] py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Explosion of Food: Using more images */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                    <FloatingDish src={comida4} size={300} top={-40} left={82} delay={0} duration={30} rotate={15} />
                    <FloatingDish src={comida10} size={200} top={250} left={3} delay={5} duration={25} rotate={-20} />
                    <FloatingDish src={comida2} size={180} top={20} left={10} delay={2} duration={28} rotate={45} opacity={0.2} />
                    <FloatingDish src={comida6} size={220} top={350} left={85} delay={7} duration={32} rotate={-10} opacity={0.2} />
                    <FloatingDish src={comida8} size={150} top={150} left={50} delay={4} duration={22} rotate={30} opacity={0.15} />
                </div>

                <div className="relative z-10 max-w-[900px] mx-auto px-12 text-center space-y-12">
                    <div className="flex justify-center">
                        <div className="relative h-16 w-16 flex items-center justify-center border border-amber-500/30 rounded-full">
                            <ShieldCheck size={32} className="text-amber-500" strokeWidth={1.5} />
                            <div className="absolute inset-0 border border-amber-500/10 rounded-full animate-ping" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Quote size={40} className="text-amber-500/20 mx-auto" />
                        <h3 className="text-3xl md:text-5xl font-light text-white tracking-tighter leading-tight italic">
                            "La gastronomía es el arte de usar los alimentos para <br />
                            <span className="font-black not-italic text-amber-500 underline decoration-1 underline-offset-8">crear felicidad</span> y elevar el espíritu."
                        </h3>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-6">
                        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                        <div className="flex items-center gap-3 text-amber-500/60">
                            <Award size={14} />
                            <span className="text-[9px] font-black uppercase tracking-[0.5em] italic">The KinalEats Seal of Excellence</span>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingDish src={comida7} size={400} top={800} left={88} delay={0} duration={40} rotate={12} opacity={0.2} />
                <FloatingDish src={comida5} size={300} top={2400} left={2} delay={6} duration={45} rotate={25} opacity={0.2} />
            </div>
        </div>
    );
};
