import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, X, Award, Flame, Leaf, ShieldCheck } from "lucide-react";

const getDishName = (dish) => dish?.nombrePlato || dish?.nombre || "Plato";
const getDishDescription = (dish) =>
    dish?.descripcionPlato ||
    dish?.description ||
    dish?.descripcion ||
    "Una creación magistral preparada al momento con ingredientes seleccionados y la pasión de nuestros chefs.";
const getDishImage = (dish) => dish?.fotosPlato || dish?.fotos || dish?.imagen || "";
const getDishPrice = (dish) => Number(dish?.precio || dish?.price || 0);

const normalizeIngredients = (dish) => {
    const rawIngredients = dish?.ingredientes || dish?.ingredients || [];
    if (!Array.isArray(rawIngredients)) return [];

    return rawIngredients
        .map((ingredient) => {
            if (typeof ingredient === "string") return ingredient;

            return (
                ingredient?.nombre ||
                ingredient?.nombreItem ||
                ingredient?.itemInventario?.nombreItem ||
                ingredient?.itemInventario?.nombre ||
                ""
            );
        })
        .filter(Boolean);
};

export const DishDetailModal = ({ open, dish, onClose, onAdd }) => {
    const [quantity, setQuantity] = useState(1);
    const ingredients = useMemo(() => normalizeIngredients(dish), [dish]);

    useEffect(() => {
        if (!open) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open || !dish) return null;

    const price = getDishPrice(dish);
    const total = price * quantity;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-6 overflow-hidden">
            {/* Backdrop con Blur Profundo */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500"
            />

            <section className="relative flex h-full md:h-auto max-h-[100vh] md:max-h-[85vh] w-full max-w-5xl flex-col md:flex-row overflow-hidden bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] md:rounded-[3rem] animate-in zoom-in-95 duration-500">
                
                {/* Close Button Floating */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 z-20 rounded-full bg-white/10 backdrop-blur-md p-3 text-white border border-white/20 transition hover:bg-white hover:text-slate-900 shadow-2xl"
                >
                    <X className="h-6 w-6" strokeWidth={2.5} />
                </button>

                {/* Left Side: Visual Experience */}
                <div className="relative h-[45%] md:h-auto md:w-[55%] bg-slate-950">
                    {getDishImage(dish) ? (
                        <img
                            src={getDishImage(dish)}
                            alt={getDishName(dish)}
                            className="h-full w-full object-cover transition-transform duration-[10s] hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-orange-950 text-8xl">
                            🥘
                        </div>
                    )}
                    
                    {/* Immersive Overlay for Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent md:bg-gradient-to-r" />
                    
                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                <Award size={12} />
                                Selección Premium
                            </span>
                            <span className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                                <ShieldCheck size={12} />
                                Calidad Garantizada
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2 md:hidden">
                            {getDishName(dish)}
                        </h2>
                    </div>
                </div>

                {/* Right Side: Details & Action */}
                <div className="flex flex-1 flex-col p-8 md:p-12 overflow-y-auto no-scrollbar bg-white">
                    <div className="hidden md:block mb-8">
                        <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">Detalles del Platillo</span>
                        <h2 className="text-5xl font-black tracking-tighter text-slate-950 leading-tight">
                            {getDishName(dish)}
                        </h2>
                    </div>

                    <div className="space-y-10 flex-1">
                        {/* Description */}
                        <div>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
                                "{getDishDescription(dish)}"
                            </p>
                        </div>

                        {/* Price Tag Luxury */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-orange-50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Precio Unitario</p>
                                    <p className="text-4xl font-black text-slate-950 tracking-tighter">Q{price.toFixed(2)}</p>
                                </div>
                                <div className="h-12 w-px bg-slate-100" />
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Estatus</p>
                                    <p className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center gap-2 justify-end">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Disponible
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-950">Ingredientes</h3>
                                <span className="h-px flex-1 mx-4 bg-slate-100" />
                            </div>

                            {ingredients.length ? (
                                <div className="flex flex-wrap gap-3">
                                    {ingredients.map((ingredient) => (
                                        <span
                                            key={ingredient}
                                            className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 text-xs font-bold text-slate-600 transition-all hover:border-orange-200 hover:bg-orange-50/30 hover:text-orange-600"
                                        >
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 font-medium bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                                    Consulte con su mesero para detalles alérgicos. Receta exclusiva de la casa.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer: Quantity & Add Button */}
                    <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-950">Ajustar Cantidad</span>
                            <div className="flex items-center gap-2 rounded-[1.5rem] bg-slate-50 p-2 border border-slate-100 shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                    className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm transition hover:text-orange-600 active:scale-90"
                                >
                                    <Minus className="h-5 w-5" strokeWidth={3} />
                                </button>
                                <span className="w-12 text-center text-xl font-black text-slate-950">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((current) => current + 1)}
                                    className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 transition hover:bg-orange-500 active:scale-90"
                                >
                                    <Plus className="h-5 w-5" strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onAdd?.(dish, quantity)}
                            className="group relative flex w-full items-center justify-between overflow-hidden rounded-[2rem] bg-slate-950 p-1 pr-6 transition-all duration-500 hover:bg-orange-600 active:scale-95 shadow-2xl shadow-slate-950/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="grid h-16 w-16 place-items-center rounded-[1.8rem] bg-white/10 text-white transition-transform duration-500 group-hover:rotate-12">
                                    <ShoppingBag className="h-7 w-7" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Finalizar Selección</span>
                                    <span className="block text-sm font-black text-white uppercase tracking-widest">Agregar al Pedido</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-white tracking-tighter transition-all group-hover:scale-110">
                                    Q{total.toFixed(2)}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};
