import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getRestaurantById, getMenus, getPlatos, getReviews } from "../../../shared/api";
import { Card, EmptyState } from "../../../shared/components";
import { showError } from "../../../shared/utils/toast";
import { useCartStore } from "../../orders/store/useCartStore";
import toast from "react-hot-toast";

export const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [platos, setPlatos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // 1. Cargar Restaurante
                const { data: restData } = await getRestaurantById(id);
                const rest = restData?.data || restData?.restaurante || restData;
                
                if (!rest || (typeof rest === 'object' && Object.keys(rest).length === 0)) {
                    throw new Error("No se encontró la información del restaurante");
                }
                setRestaurant(rest);

                // 2. Cargar Menús del restaurante
                const { data: menuData } = await getMenus({ restaurante: id });
                const menusList = menuData?.data || menuData?.menus || menuData || [];
                setMenus(menusList);

                if (menusList.length > 0) {
                    const firstMenuId = menusList[0]._id || menusList[0].id;
                    setActiveMenuId(firstMenuId);
                    
                    // 3. Cargar platos del primer menú
                    const { data: platosData } = await getPlatos(firstMenuId);
                    setPlatos(platosData?.data || platosData?.platos || platosData || []);
                }

                // 4. Cargar Reseñas específicas de este restaurante
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
        } catch (err) {
            showError("No se pudieron cargar los platos de este menú");
        }
    };

    const handleAddToCart = (plato) => {
        addItem({
            id: plato._id || plato.id,
            name: plato.nombrePlato || plato.nombre,
            price: plato.precio,
            image: plato.fotosPlato || plato.fotos
        }, id);
        toast.success(`${plato.nombrePlato || plato.nombre} agregado al carrito`, {
            icon: '🛒',
            style: { borderRadius: '16px', background: '#333', color: '#fff' }
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <EmptyState
                title="Restaurante no encontrado"
                description="Lo sentimos, no pudimos encontrar el restaurante que buscas."
                actionLabel="Volver al inicio"
                onAction={() => window.history.back()}
            />
        );
    }

    return (
        <div className="relative pb-20">
            {/* Hero Header */}
            <header className="relative -mx-4 md:-mx-6 -mt-6 md:-mt-8 h-[300px] md:h-[450px] overflow-hidden shadow-2xl md:rounded-b-[4rem]">
                {restaurant?.fotos ? (
                    <img
                        src={restaurant.fotos}
                        alt={restaurant?.nombre}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="mx-auto max-w-5xl">
                        <Link to="/home" className="mb-4 inline-flex items-center gap-2 text-xs md:text-sm font-bold text-white/80 hover:text-white transition">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
                            <div className="max-w-3xl">
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <span className="rounded-lg bg-orange-500 px-2.5 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                                        {restaurant?.categoria || "Premium"}
                                    </span>
                                    <span className="rounded-lg bg-white/20 px-2.5 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                                        Abierto
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-white md:text-6xl">
                                    {restaurant?.nombre}
                                </h1>
                                <p className="mt-2 md:mt-4 line-clamp-2 md:line-clamp-none text-sm md:text-lg text-slate-300 leading-relaxed">
                                    {restaurant?.descripcion || "Una experiencia culinaria única diseñada para los paladares más exigentes."}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-white/10 pt-4 md:border-none md:pt-0">
                                <div className="text-center md:text-right">
                                    <div className="flex items-center gap-1 justify-center md:justify-end">
                                        <span className="text-xl md:text-2xl font-black text-orange-400">4.9</span>
                                        <span className="text-orange-400 text-sm">★</span>
                                    </div>
                                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Calificación</p>
                                </div>
                                <div className="h-8 md:h-10 w-px bg-white/10" />
                                <div className="text-center md:text-right">
                                    <div className="text-xl md:text-2xl font-black text-white">25m</div>
                                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">Entrega</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sticky Menu Navigation - Horizontal Scroll */}
            <nav className="sticky top-0 z-30 -mx-4 md:-mx-6 bg-white/90 border-b border-slate-100 px-4 md:px-6 py-3 md:py-4 backdrop-blur-xl shadow-sm">
                <div className="mx-auto max-w-5xl">
                    <div className="flex gap-2.5 md:gap-4 overflow-x-auto no-scrollbar">
                        {menus.map((menu) => (
                            <button
                                key={menu._id || menu.id}
                                onClick={() => handleMenuChange(menu._id || menu.id)}
                                className={`min-w-max rounded-full md:rounded-xl px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold transition-all ${
                                    activeMenuId === (menu._id || menu.id)
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                            >
                                {menu.nombreMenu || menu.nombre}
                            </button>
                        ))}
                        <a href="#reviews" className="min-w-max rounded-full md:rounded-xl px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold bg-orange-50 text-orange-600">
                            Reseñas ({reviews.length})
                        </a>
                    </div>
                </div>
            </nav>

            {/* Menu Sections and Dishes */}
            <main className="mx-auto mt-8 md:mt-12 max-w-5xl px-0 md:px-2">
                <div className="mb-6 md:mb-8 flex items-center justify-between px-2 md:px-0">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                        {menus.find(m => (m._id || m.id) === activeMenuId)?.nombreMenu || menus.find(m => (m._id || m.id) === activeMenuId)?.nombre || "Nuestros Platos"}
                    </h2>
                    <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{platos.length} platos</span>
                </div>

                {platos.length > 0 ? (
                    <div className="grid gap-4 md:gap-6 md:grid-cols-2">
                        {platos.map((plato) => (
                            <div 
                                key={plato._id || plato.id}
                                className="group relative flex flex-col sm:flex-row overflow-hidden rounded-3xl bg-white p-3 md:p-4 border border-slate-100 transition-all duration-300 hover:border-orange-200 hover:shadow-xl"
                            >
                                <div className="h-40 w-full sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50 mb-3 sm:mb-0">
                                    {(plato.fotosPlato || plato.fotos) ? (
                                        <img
                                            src={plato.fotosPlato || plato.fotos}
                                            alt={plato.nombrePlato || plato.nombre}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-3xl">🍲</div>
                                    )}
                                </div>
                                <div className="sm:ml-5 flex flex-1 flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-orange-500 transition-colors">
                                                {plato.nombrePlato || plato.nombre}
                                            </h3>
                                            <span className="text-base md:text-lg font-black text-slate-900">
                                                Q{plato.precio.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-xs md:text-sm text-slate-500 leading-relaxed">
                                            {plato.descripcionPlato || plato.descripcion || "Un plato delicioso preparado con los ingredientes más frescos de temporada."}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {plato.tipoPlato || "Plato fuerte"}
                                        </span>
                                        <button 
                                            onClick={() => handleAddToCart(plato)}
                                            className="flex-1 sm:flex-none rounded-xl bg-slate-900 px-4 py-2 text-[10px] md:text-xs font-black text-white transition-all hover:bg-orange-500 active:scale-95 shadow-md"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-100 py-20 text-center">
                        <span className="mb-4 text-6xl opacity-20">🍽️</span>
                        <h3 className="text-xl font-bold text-slate-400">No hay platos en esta categoría</h3>
                    </div>
                )}

                {/* Reviews Section */}
                <section id="reviews" className="mt-24 space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Experiencias de clientes</h2>
                            <p className="text-slate-500 font-medium">Lo que dicen los amantes de la buena comida sobre {restaurant?.nombre}.</p>
                        </div>
                        <Link to="/home/reviews" className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                            Escribir reseña
                        </Link>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {reviews.map((review) => (
                                <div key={review._id || review.id} className="rounded-[2rem] bg-slate-50 p-8 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xl">
                                                {(review.usuario?.nombre || "U")[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{review.usuario?.nombre} {review.usuario?.apellido}</p>
                                                <div className="flex gap-0.5 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span key={star} className={star <= review.calificacion ? "text-amber-400 text-xs" : "text-slate-200 text-xs"}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 italic leading-relaxed font-medium">
                                        "{review.comentario}"
                                    </p>
                                    {review.fotoResena && (
                                        <img src={review.fotoResena} alt="Foto reseña" className="mt-6 h-48 w-full rounded-2xl object-cover" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[3rem] bg-slate-50/50 border border-dashed border-slate-200 py-16 text-center">
                            <p className="text-slate-400 font-bold">Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};
