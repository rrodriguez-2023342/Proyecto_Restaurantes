import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Search, MapPin, Clock, Star, ChevronLeft, ShoppingCart, Award, ShieldCheck, Heart, Info, ArrowRight, Quote, Sparkles, Utensils, Timer, Zap, Users, Flame, ChefHat, Leaf } from "lucide-react";
import { getRestaurantById, getMenus, getPlatos, getReviews } from "../../../shared/api";
import { EmptyState } from "../../../shared/components";
import { showError } from "../../../shared/utils/toast";
import { useCartStore } from "../../orders/store/useCartStore";
import toast from "react-hot-toast";
import { DishDetailModal } from "../../platos/components/DishDetailModal.jsx";
import { ReviewForm } from "../../reviews/components/ReviewForm.jsx";
import { ReviewList } from "../../reviews/components/ReviewList.jsx";

// Imágenes de comida para fondo dinámico
import comida1 from "../../../assets/images/comida1.png";
import comida3 from "../../../assets/images/comida3.png";
import comida7 from "../../../assets/images/comida7.png";
import comida9 from "../../../assets/images/comida9.png";

const FloatingDish = ({ src, delay, duration, size, top, left, rotate, opacity = 0.2 }) => (
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
        <img src={src} alt="" className="w-full h-full object-contain" />
    </div>
);

export const UserRestaurantDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [platos, setPlatos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [selectedDish, setSelectedDish] = useState(null);
    const [reviewToEdit, setReviewToEdit] = useState(null);
    
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const { data: restData } = await getRestaurantById(id);
                const rest = restData?.data || restData?.restaurante || restData;
                
                if (!rest || (typeof rest === 'object' && Object.keys(rest).length === 0)) {
                    throw new Error("No se encontró la información del restaurante");
                }
                setRestaurant(rest);

                const { data: menuData } = await getMenus({ restaurante: id });
                const menusList = menuData?.data || menuData?.menus || menuData || [];
                setMenus(menusList);

                if (menusList.length > 0) {
                    const firstMenuId = menusList[0]._id || menusList[0].id;
                    setActiveMenuId(firstMenuId);
                    
                    const { data: platosData } = await getPlatos(firstMenuId);
                    setPlatos(platosData?.data || platosData?.platos || platosData || []);
                }

                const { data: reviewsData } = await getReviews({ restaurante: id });
                setReviews(reviewsData?.data || reviewsData?.resenas || []);

            } catch (err) {
                console.error("Error detallado en RestaurantDetail:", err);
                showError(`Error: ${err.response?.data?.message || err.message || "No se pudo cargar la información"}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleMenuChange = async (menuId) => {
        setActiveMenuId(menuId);
        try {
            const { data } = await getPlatos(menuId);
            setPlatos(data?.data || data?.platos || data || []);
        } catch {
            showError("No se pudieron cargar los platos de este menú");
        }
        setSelectedDish(null);
    };

    const handleOpenDish = (plato) => {
        setSelectedDish(plato);
    };

    const handleAddToCart = (plato, quantity = 1) => {
        addItem({
            id: plato._id || plato.id,
            name: plato.nombrePlato || plato.nombre,
            price: plato.precio,
            image: plato.fotosPlato || plato.fotos
        }, id, quantity);
        toast.success(`${plato.nombrePlato || plato.nombre} agregado`, {
            icon: '🛒',
            style: { borderRadius: '0px', background: '#000', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
        });
        setSelectedDish(null);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-12 w-12 border-4 border-black border-t-transparent animate-spin rounded-full" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="py-20">
                <EmptyState
                    title="Restaurante no encontrado"
                    description="Lo sentimos, no pudimos encontrar el restaurante que buscas."
                    actionLabel="Volver al inicio"
                    onAction={() => window.history.back()}
                />
            </div>
        );
    }

    return (
        <div className="relative bg-[#f9f9f9] min-h-screen overflow-x-hidden font-sans antialiased text-black">
            
            {/* ── SENIOR ARCHITECTURAL HERO ── */}
            <header className="relative h-[550px] bg-black overflow-hidden">
                <div className="absolute inset-0">
                    {restaurant?.fotos ? (
                        <img
                            src={restaurant.fotos}
                            alt={restaurant?.nombre}
                            className="h-full w-full object-cover opacity-50 grayscale-[0.2]"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#050505]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>

                {/* Corner Back Button */}
                <div className="absolute top-10 left-10 z-50">
                    <Link 
                        to="/home/restaurants" 
                        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 text-white/50 hover:text-white hover:border-white transition-all active:scale-90"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-20 lg:px-32 pb-16 md:pb-20 max-w-[1500px] mx-auto w-full">
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-8 md:w-10 bg-amber-500" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-amber-500">
                                {restaurant?.categoria || "Selección Gourmet"}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-9xl font-black tracking-tightest text-white leading-[1.1] md:leading-none uppercase">
                            {restaurant?.nombre}
                        </h1>
 
                        <div className="max-w-2xl border-l-4 border-amber-500 pl-6 md:pl-10">
                            <p className="text-lg md:text-2xl text-white/60 font-light leading-relaxed italic">
                                "{restaurant?.descripcion || "Una odisea culinaria diseñada para los paladares más rebeldes."}"
                            </p>
                        </div>

                        <div className="flex items-center gap-14 pt-4">
                            <div className="flex items-center gap-4">
                                <Star size={16} className="text-amber-500" fill="currentColor" />
                                <span className="text-2xl font-black text-white tracking-tighter">4.9</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30">Rating General</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Clock size={16} className="text-white/20" />
                                <span className="text-2xl font-black text-white tracking-tighter">25</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Minutos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── STICKY MENU BAR ── */}
            <nav className="sticky top-0 z-40 bg-black text-white shadow-2xl overflow-hidden">
                <div className="max-w-[1500px] mx-auto px-6 md:px-20 py-4 md:py-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                    <div className="flex gap-8 md:gap-14 overflow-x-auto no-scrollbar items-center pb-2 md:pb-0">
                        <div className="flex items-center gap-3 md:gap-4 pr-6 md:pr-10 border-r border-white/10 shrink-0">
                            <Utensils size={16} className="text-amber-500" />
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">La Carta</span>
                        </div>
                        {menus.map((menu) => (
                            <button
                                key={menu._id || menu.id}
                                onClick={() => handleMenuChange(menu._id || menu.id)}
                                className={`group relative py-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all shrink-0 ${
                                    activeMenuId === (menu._id || menu.id)
                                        ? "text-white scale-105"
                                        : "text-white/30 hover:text-white/60"
                                }`}
                            >
                                {menu.nombreMenu || menu.nombre}
                                {activeMenuId === (menu._id || menu.id) && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-500 animate-in slide-in-from-left duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                    <Link
                        to={`/home/restaurants/${id}/reservar`}
                        className="flex items-center justify-center gap-4 bg-amber-600 text-white px-8 md:px-10 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl"
                    >
                        Reservar Mesa
                    </Link>
                </div>
            </nav>

            {/* ── GOURMET REBEL CONTENT ── */}
            <main className="max-w-[1500px] mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-32">
                <div className="grid lg:grid-cols-[1fr_400px] gap-12 md:gap-24">
                    
                    {/* DISHES: THE RESTAURANT EXPERIENCE */}
                    <div className="space-y-12 md:space-y-24">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-black pb-8 gap-6">
                            <div className="space-y-3 md:space-y-4">
                                <span className="text-amber-600 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[10px] block">Nuestras Creaciones</span>
                                <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter uppercase italic leading-tight">
                                    {menus.find(m => (m._id || m.id) === activeMenuId)?.nombreMenu || "Menú de Autor"}
                                </h2>
                            </div>
                            <span className="text-[10px] md:text-[11px] font-black text-black/20 uppercase tracking-[0.4em]">{platos.length} Delicias</span>
                        </div>

                        {platos.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2">
                                {platos.map((plato) => (
                                    <div 
                                        key={plato._id || plato.id}
                                        onClick={() => handleOpenDish(plato)}
                                        className="group relative h-[420px] w-full overflow-hidden rounded-3xl cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-500"
                                    >
                                        {/* Background Image */}
                                        <div className="absolute inset-0 bg-slate-900">
                                            {(plato.fotosPlato || plato.fotos) ? (
                                                <img
                                                    src={plato.fotosPlato || plato.fotos}
                                                    alt={plato.nombrePlato || plato.nombre}
                                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-700 text-6xl">
                                                    <Utensils size={48} />
                                                </div>
                                            )}
                                            {/* Magazine Style Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                                        </div>
                                        
                                        {/* Content Overlay */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <div className="relative z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="flex justify-between items-start gap-4 mb-3">
                                                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none group-hover:text-amber-500 transition-colors">
                                                        {plato.nombrePlato || plato.nombre}
                                                    </h3>
                                                    <span className="bg-amber-500 text-black px-3 py-1 text-sm font-black rounded-lg shrink-0 shadow-lg">
                                                        Q{plato.precio.toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="h-px w-12 bg-amber-500/50 mb-4 transition-all duration-500 group-hover:w-24" />
                                                <p className="text-sm text-white/70 line-clamp-2 font-medium leading-relaxed">
                                                    {plato.descripcionPlato || "Una obra maestra culinaria preparada con ingredientes frescos de la región. Sabores auténticos que deleitan el paladar."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center border border-slate-200 rounded-3xl bg-slate-50/50">
                                <Utensils size={64} className="mx-auto mb-6 text-slate-300" />
                                <h3 className="text-xl font-bold text-slate-400">Menú en Creación</h3>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR: RESTAURANT CONCIERGE ── */}
                    <aside className="space-y-16">
                        <div className="sticky top-40 space-y-16">
                            
                            {/* Contact Card - Dynamic Map Style */}
                            <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-xl shadow-slate-200/50 space-y-0 overflow-hidden">
                                {/* Interactive Google Maps Iframe */}
                                <div className="h-[220px] w-full rounded-t-[20px] overflow-hidden relative bg-slate-100">
                                    <iframe 
                                        title="Ubicación del Restaurante"
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(restaurant?.direccion?.calle ? `${restaurant.direccion.calle}, Guatemala` : "Ciudad de Guatemala")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        allowFullScreen
                                    ></iframe>
                                    {/* Inner shadow overlay for depth */}
                                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                                </div>
                                
                                <div className="p-8 space-y-8">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.3em]">Visítanos</span>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                                            {restaurant?.nombre || "El Santuario."}
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <div className="mt-1 shrink-0 bg-orange-50 text-amber-600 p-2 rounded-full">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dirección</span>
                                                <p className="text-sm font-bold text-slate-900 leading-snug">
                                                    {restaurant?.direccion?.calle || "Avenida Principal"}, GUA
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="mt-1 shrink-0 bg-orange-50 text-amber-600 p-2 rounded-full">
                                                <Timer size={18} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Servicio</span>
                                                <p className="text-sm font-bold text-slate-900 leading-snug">Premium Activo</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/home/restaurants/${id}/reservar`}
                                        className="flex items-center justify-center gap-3 w-full bg-slate-950 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                                    >
                                        RESERVAR MESA
                                    </Link>
                                </div>
                            </div>

                            {/* Seal of Excellence */}
                            <div className="pt-10 flex flex-col items-center gap-6 text-center border-t-2 border-black/5 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                                <ShieldCheck size={40} />
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.6em]">KinalEats Certified</span>
                                    <p className="text-[10px] font-bold italic">Excelencia Gastronómica 2024</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* REVIEWS: CONNOISSEUR STYLE ── */}
                <section id="reviews" className="mt-40 pt-20 border-t border-slate-100 grid lg:grid-cols-[400px_1fr] gap-20">
                    <div className="space-y-10">
                        <div className="sticky top-40 space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-amber-600">
                                    <Users size={18} />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">La Crítica</span>
                                </div>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                                    Voz de la <br /> Audiencia
                                </h2>
                            </div>
                            <ReviewForm 
                                restaurantId={id} 
                                initialData={reviewToEdit}
                                onCancelEdit={() => setReviewToEdit(null)}
                            />
                        </div>
                    </div>
                    <div className="space-y-20">
                        <ReviewList 
                            restaurantId={id} 
                            onEdit={(review) => {
                                setReviewToEdit(review);
                                window.scrollTo({ top: document.getElementById('reviews').offsetTop - 50, behavior: 'smooth' });
                            }}
                        />
                    </div>
                </section>
            </main>

            {/* Atmosphere - subtle but present */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05] grayscale">
                <FloatingDish src={comida7} size={450} top={1400} left={85} delay={0} duration={40} rotate={15} />
                <FloatingDish src={comida9} size={350} top={3800} left={-5} delay={5} duration={45} rotate={-20} />
            </div>

            {/* Dish Detail Modal */}
            {selectedDish && (
                <DishDetailModal
                    key={selectedDish._id || selectedDish.id || selectedDish.nombrePlato || selectedDish.nombre}
                    open
                    dish={selectedDish}
                    onClose={() => setSelectedDish(null)}
                    onAdd={handleAddToCart}
                />
            )}
        </div>
    );
};
