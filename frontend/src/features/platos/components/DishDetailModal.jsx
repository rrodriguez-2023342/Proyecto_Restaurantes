import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, X, Award, Flame, Leaf, ShieldCheck, Check, ChefHat } from "lucide-react";
import { useInventoryStore } from "../../inventory/store/useInventoryStore";

const getDishName = (dish) => dish?.nombrePlato || dish?.nombre || "Plato";
const getDishDescription = (dish) =>
    dish?.descripcionPlato ||
    dish?.description ||
    dish?.descripcion ||
    "Una creación magistral preparada al momento con ingredientes seleccionados y la pasión de nuestros chefs.";
const getDishImage = (dish) => dish?.fotosPlato || dish?.fotos || dish?.imagen || "";
const getDishPrice = (dish) => Number(dish?.precio || dish?.price || 0);

export const DishDetailModal = ({ open, dish, onClose, onAdd }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    
    // Conectamos con el inventario para traducir los IDs a nombres reales
    const { inventarios, fetchInventarios } = useInventoryStore();

    useEffect(() => {
        if (open) {
            // Atrapamos cualquier error de permisos (403) para evitar que la app se congele
            fetchInventarios().catch(err => {
                console.warn("No se pudo cargar el inventario completo, usando fallback de IDs", err);
            });
        }
    }, [open, fetchInventarios]);

    const ingredients = useMemo(() => {
        let rawIngredients = dish?.ingredientes || dish?.ingredients || [];
        
        if (typeof rawIngredients === 'string') {
            try {
                rawIngredients = JSON.parse(rawIngredients);
            } catch (e) {
                return [];
            }
        }

        if (!Array.isArray(rawIngredients)) return [];

        return rawIngredients
            .map((ingredient) => {
                if (!ingredient) return "";
                
                // Extraer el ID para buscar
                const idToSearch = typeof ingredient === "string" 
                    ? ingredient 
                    : (ingredient?.itemInventario?._id || ingredient?.itemInventario?.id || ingredient?.itemInventario || ingredient?.id || ingredient?._id);
                
                let name = idToSearch;

                // Buscar en el inventario
                if (idToSearch && inventarios?.length > 0) {
                    const found = inventarios.find(i => i._id === idToSearch || i.id === idToSearch);
                    if (found && found.nombreItem) {
                        name = found.nombreItem;
                    }
                }

                // Fallback si no lo encontró
                if (name === idToSearch && typeof ingredient !== "string") {
                    name = ingredient?.nombre || 
                           ingredient?.nombreItem || 
                           ingredient?.itemInventario?.nombreItem || 
                           ingredient?.itemInventario?.nombre || 
                           idToSearch;
                }

                return name || "";
            })
            .filter(Boolean);
    }, [dish, inventarios]);

    useEffect(() => {
        if (!open) {
            setQuantity(1);
            setIsAdding(false);
            return undefined;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !isAdding) onClose?.();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose, isAdding]);

    if (!open || !dish) return null;

    const price = getDishPrice(dish);
    const total = price * quantity;

    const handleAddClick = () => {
        if (isAdding) return;
        setIsAdding(true);
        setTimeout(() => {
            onAdd?.(dish, quantity);
            onClose?.();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-6 overflow-hidden">
            {/* Backdrop con Blur Profundo */}
            <div
                onClick={() => !isAdding && onClose()}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
            />

            <section className="relative flex h-full md:h-auto max-h-[100vh] md:max-h-[85vh] w-full max-w-[1100px] flex-col md:flex-row overflow-hidden bg-white shadow-2xl md:rounded-[2.5rem] animate-in zoom-in-[0.98] duration-300">
                
                {/* Close Button Floating */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isAdding}
                    className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100/80 backdrop-blur-md text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90 disabled:opacity-50"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* Left Side: Visual Experience */}
                <div className="relative h-[40%] md:h-auto md:w-[45%] bg-slate-50">
                    {getDishImage(dish) ? (
                        <img
                            src={getDishImage(dish)}
                            alt={getDishName(dish)}
                            className="h-full w-full object-cover transition-transform duration-[10s] hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-200">
                            <ChefHat size={120} strokeWidth={1} />
                        </div>
                    )}
                    
                    {/* Immersive Overlay for Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                    
                    <div className="absolute bottom-6 left-6 right-6 md:hidden">
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
                            {getDishName(dish)}
                        </h2>
                    </div>
                </div>

                {/* Right Side: Details & Action */}
                <div className="flex flex-1 flex-col p-8 md:p-12 overflow-y-auto bg-white">
                    <div className="hidden md:block mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-[2px] w-8 bg-amber-500" />
                            <span className="text-amber-600 font-bold uppercase tracking-[0.3em] text-[10px]">Detalles de la Selección</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
                            {getDishName(dish)}
                        </h2>
                    </div>

                    <div className="space-y-10 flex-1">
                        {/* Description */}
                        <div>
                            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed">
                                {getDishDescription(dish)}
                            </p>
                        </div>

                        {/* Price Tag Luxury */}
                        <div className="relative p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Precio Unitario</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">Q{price.toFixed(2)}</p>
                                </div>
                                <div className="h-10 w-px bg-slate-200" />
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Disponibilidad</p>
                                    <div className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 justify-end">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        En Cocina
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                                <Leaf size={14} className="text-amber-500" />
                                Composición del Plato
                            </h3>

                            {ingredients.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {ingredients.map((ingredient) => (
                                        <span
                                            key={ingredient}
                                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-amber-300 hover:text-amber-600 cursor-default"
                                        >
                                            {ingredient}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 font-medium bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                    Receta de autor. Consulte con su mesero para detalles alérgicos o requerimientos especiales.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer: Quantity & Add Button */}
                    <div className="mt-10 pt-8 border-t border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Cantidad deseada</span>
                            <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm">
                                <button
                                    type="button"
                                    disabled={isAdding}
                                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-90 disabled:opacity-50"
                                >
                                    <Minus size={16} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center text-lg font-black text-slate-900">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    disabled={isAdding}
                                    onClick={() => setQuantity((current) => current + 1)}
                                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-amber-500 active:scale-90 disabled:opacity-50"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddClick}
                            disabled={isAdding}
                            className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl p-2 pr-6 transition-all duration-500 shadow-lg ${
                                isAdding 
                                    ? "bg-emerald-600 shadow-emerald-600/30 scale-[0.98]" 
                                    : "bg-slate-950 hover:bg-amber-600 shadow-slate-900/20 active:scale-[0.98]"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`grid h-14 w-14 place-items-center rounded-xl transition-all duration-500 ${
                                    isAdding ? "bg-white/20 rotate-0 scale-110" : "bg-white/10 group-hover:-rotate-12"
                                }`}>
                                    {isAdding ? (
                                        <Check className="h-6 w-6 text-white animate-in zoom-in duration-300" strokeWidth={3} />
                                    ) : (
                                        <ShoppingBag className="h-6 w-6 text-white" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                                        {isAdding ? "Operación Exitosa" : "Finalizar Selección"}
                                    </span>
                                    <span className="block text-sm font-black text-white uppercase tracking-widest">
                                        {isAdding ? "Agregado" : "Agregar al Pedido"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`block text-2xl font-black text-white tracking-tighter transition-all ${
                                    isAdding ? "opacity-0 translate-x-4" : "opacity-100 group-hover:scale-105"
                                }`}>
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
