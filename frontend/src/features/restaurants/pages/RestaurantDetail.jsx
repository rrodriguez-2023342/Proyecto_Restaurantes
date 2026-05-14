import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Search, MapPin, Clock, Star, ChevronLeft, ShoppingCart, Award, ShieldCheck, Heart, Info, ArrowRight } from "lucide-react";
import { getRestaurantById, getMenus, getPlatos, getReviews } from "../../../shared/api";
import { EmptyState } from "../../../shared/components";
import { showError } from "../../../shared/utils/toast";
import { useCartStore } from "../../orders/store/useCartStore";
import toast from "react-hot-toast";
import { DishDetailModal } from "../../platos/components/DishDetailModal.jsx";
import { ReviewForm } from "../../reviews/components/ReviewForm.jsx";
import { ReviewList } from "../../reviews/components/ReviewList.jsx";

export const RestaurantDetail = () => {
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
    const isUserView = location.pathname.startsWith("/home/");

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
        if (!isUserView) return;
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
            style: { borderRadius: '24px', background: '#0f172a', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
        });
        setSelectedDish(null);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center bg-white">
                <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-8 border-orange-500/20" />
                    <div className="absolute inset-0 rounded-full border-8 border-orange-500 border-t-transparent animate-spin" />
                </div>
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
        <div className="relative pb-32">
            {/* ── CINEMATIC HERO: FULL BLEED ── */}
            <header className="relative -mx-4 md:-mx-6 lg:-mx-8 -mt-6 md:-mt-8 h-[550px] md:h-[750px] overflow-hidden group">
                {restaurant?.fotos ? (
                    <img
                        src={restaurant.fotos}
                        alt={restaurant?.nombre}
                        className="h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-950" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-slate-950/20" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 lg:p-32">
                    <div className="mx-auto max-w-[1600px] w-full">
                        <Link to="/home/restaurants" className="mb-12 inline-flex items-center gap-4 rounded-full bg-white/10 backdrop-blur-xl px-8 py-4 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                            <ChevronLeft size={18} strokeWidth={3} />
                            Explorar Restaurantes
                        </Link>
                        
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
                            <div className="max-w-5xl animate-in slide-in-from-bottom duration-700">
                                <div className="mb-8 flex flex-wrap gap-4">
                                    <span className="rounded-xl bg-orange-500 px-6 py-3 text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-500/40">
                                        {restaurant?.categoria || "Premium Experience"}
                                    </span>
                                    <div className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-xl px-6 py-3 border border-white/10">
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Servicio Activo</span>
                                    </div>
                                </div>
                                <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter text-white leading-[0.8] mb-10 italic">
                                    {restaurant?.nombre}
                                </h1>
                                <p className="text-xl md:text-3xl text-slate-300 font-medium leading-relaxed max-w-4xl italic opacity-90">
                                    "{restaurant?.descripcion || "Una experiencia culinaria diseñada para elevar tus sentidos y crear recuerdos inolvidables."}"
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-14 animate-in fade-in duration-1000 delay-300">
                                <div className="text-center lg:text-right">
                                    <div className="flex items-center gap-3 justify-center lg:justify-end mb-2">
                                        <span className="text-5xl md:text-7xl font-black text-orange-400 tracking-tighter">4.9</span>
                                        <Star size={32} className="text-orange-400" fill="currentColor" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Puntuación Gourmet</p>
                                </div>
                                <div className="h-20 w-px bg-white/10 hidden lg:block" />
                                <div className="text-center lg:text-right">
                                    <div className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">25<span className="text-orange-500">m</span></div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Espera Estimada</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── STICKY MENU NAV ── */}
            <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-3xl border-b border-slate-100 shadow-2xl shadow-slate-900/5">
                <div className="mx-auto max-w-[1600px] px-8 py-8 flex items-center justify-between">
                    <div className="flex gap-10 md:gap-14 overflow-x-auto no-scrollbar scroll-smooth">
                        {menus.map((menu) => (
                            <button
                                key={menu._id || menu.id}
                                onClick={() => handleMenuChange(menu._id || menu.id)}
                                className={`relative min-w-max py-2 text-sm font-black uppercase tracking-[0.3em] transition-all ${
                                    activeMenuId === (menu._id || menu.id)
                                        ? "text-slate-950 scale-105"
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {menu.nombreMenu || menu.nombre}
                                {activeMenuId === (menu._id || menu.id) && (
                                    <div className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full bg-orange-500 animate-in slide-in-from-left duration-300" />
                                )}
                            </button>
                        ))}
                    </div>
                    {isUserView && (
                        <Link
                            to={`/home/restaurants/${id}/reservar`}
                            className="hidden md:flex items-center gap-4 rounded-full bg-slate-950 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl hover:bg-orange-500 transition-all active:scale-95"
                        >
                            <Clock size={18} />
                            Reservar Mesa
                        </Link>
                    )}
                </div>
            </nav>

            {/* ── MAIN CONTENT ── */}
            <main className="mx-auto mt-24 max-w-[1600px] px-8 lg:px-20">
                <div className="grid lg:grid-cols-[1fr_400px] gap-24">
                    
                    {/* DISHES SECTION: ROUNDED CARDS RESTORED */}
                    <div className="space-y-20">
                        <div className="flex items-end justify-between border-b border-slate-100 pb-10">
                            <div>
                                <span className="text-orange-500 font-black uppercase tracking-[0.5em] text-[11px] mb-4 block">Nuestra Carta</span>
                                <h2 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter italic">
                                    {menus.find(m => (m._id || m.id) === activeMenuId)?.nombreMenu || "Selección Especial"}
                                </h2>
                            </div>
                            <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{platos.length} Exclusividades</span>
                        </div>

                        {platos.length > 0 ? (
                            <div className="grid gap-12 md:grid-cols-2">
                                {platos.map((plato) => (
                                    <div 
                                        key={plato._id || plato.id}
                                        onClick={() => handleOpenDish(plato)}
                                        className="group relative flex flex-col gap-8 p-6 rounded-[3rem] bg-white border border-slate-100 transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-4 cursor-pointer overflow-hidden"
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-50">
                                            {(plato.fotosPlato || plato.fotos) ? (
                                                <img
                                                    src={plato.fotosPlato || plato.fotos}
                                                    alt={plato.nombrePlato || plato.nombre}
                                                    className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-125"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-6xl">🥘</div>
                                            )}
                                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-2xl shadow-slate-950/20">
                                                    <ArrowRight size={24} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-2xl font-black text-slate-950 tracking-tight group-hover:text-orange-600 transition-colors italic">
                                                    {plato.nombrePlato || plato.nombre}
                                                </h3>
                                                <span className="text-3xl font-black text-slate-950 tracking-tighter">
                                                    Q{plato.precio.toFixed(0)}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-base text-slate-500 font-medium leading-relaxed italic opacity-80">
                                                {plato.descripcionPlato || "Una creación magistral preparada por nuestros chefs con ingredientes de la más alta calidad."}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-32 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
                                <Info size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest italic">Selección en preparación</h3>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR: ROUNDED CARDS RESTORED ── */}
                    <aside className="space-y-16">
                        <div className="sticky top-40 space-y-16">
                            <div className="bg-orange-500 p-12 text-white shadow-2xl shadow-orange-500/30 overflow-hidden relative group rounded-[4rem]">
                                <div className="absolute top-0 right-0 h-64 w-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                                <h3 className="text-4xl font-black tracking-tighter mb-6 relative z-10 italic leading-tight">¿Prefieres visitarnos?</h3>
                                <p className="text-orange-100 font-medium mb-10 relative z-10 leading-relaxed text-lg italic">Asegura tu mesa en el santuario del sabor. Servicio VIP y ambiente inigualable.</p>
                                <Link
                                    to={`/home/restaurants/${id}/reservar`}
                                    className="block w-full text-center rounded-[2rem] bg-white py-6 text-[11px] font-black uppercase tracking-[0.4em] text-orange-500 shadow-2xl hover:-translate-y-2 transition-all active:scale-95"
                                >
                                    Reservar Ahora
                                </Link>
                            </div>

                            <div className="space-y-10 px-8">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 border-b border-slate-100 pb-6">Contacto Élite</h4>
                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"><MapPin size={22} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Ubicación</p>
                                            <p className="text-base font-black text-slate-900 tracking-tight">{restaurant?.direccion?.calle || "Avenida Gourmet"}, {restaurant?.direccion?.ciudad || "Ciudad"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm"><Clock size={22} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Horarios</p>
                                            <p className="text-base font-black text-slate-900 tracking-tight">Abierto todos los días</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* ── REVIEWS SECTION ── */}
                <section id="reviews" className="mt-48 grid lg:grid-cols-[450px_1fr] gap-32 border-t border-slate-100 pt-32">
                    <div className="space-y-10">
                        <div className="sticky top-40">
                            <span className="text-orange-500 font-black uppercase tracking-[0.5em] text-[11px] mb-6 block italic">Comunidad</span>
                            <h2 className="text-6xl font-black text-slate-950 tracking-tighter mb-8 leading-[0.9] italic">Críticas de Conocedores.</h2>
                            <p className="text-xl text-slate-500 font-medium mb-16 leading-relaxed italic opacity-80">Tu opinión es el sello de calidad que guía a nuestra comunidad hacia lo extraordinario.</p>
                            <div className="p-12 bg-slate-50 border border-slate-100 shadow-2xl rounded-[4rem]">
                                <ReviewForm 
                                    restaurantId={id} 
                                    initialData={reviewToEdit}
                                    onCancelEdit={() => setReviewToEdit(null)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-16">
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
