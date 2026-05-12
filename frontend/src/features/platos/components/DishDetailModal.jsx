import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

const getDishName = (dish) => dish?.nombrePlato || dish?.nombre || "Plato";
const getDishDescription = (dish) =>
    dish?.descripcionPlato ||
    dish?.description ||
    dish?.descripcion ||
    "Una receta preparada al momento con ingredientes frescos y mucho sabor.";
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
        <div className="fixed inset-0 z-[70]">
            <button
                type="button"
                aria-label="Cerrar modal"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <div className="absolute inset-0 flex items-end justify-center md:items-center md:p-6">
                <section className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl shadow-slate-950/20 md:max-h-[85vh] md:rounded-[2rem]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow-lg transition hover:bg-white hover:text-slate-900"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-200 md:hidden" />

                    <div className="grid overflow-y-auto md:grid-cols-[1.05fr_0.95fr]">
                        <div className="relative h-72 bg-slate-100 md:h-full md:min-h-[34rem]">
                            {getDishImage(dish) ? (
                                <img
                                    src={getDishImage(dish)}
                                    alt={getDishName(dish)}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-white text-7xl">
                                    {dish?.emoji || "🍽"}
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 to-transparent px-6 py-6 md:hidden">
                                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-200">
                                    {dish?.tipoPlato || "Seleccion del chef"}
                                </p>
                                <h2 className="mt-2 text-2xl font-black text-white">{getDishName(dish)}</h2>
                            </div>
                        </div>

                        <div className="flex flex-col p-6 sm:p-7">
                            <div className="hidden md:block">
                                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-orange-500">
                                    {dish?.tipoPlato || "Seleccion del chef"}
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                                    {getDishName(dish)}
                                </h2>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600 md:mt-5">
                                {getDishDescription(dish)}
                            </p>

                            <div className="mt-6 rounded-3xl border border-orange-100 bg-orange-50/70 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">
                                    Precio
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">Q{price.toFixed(2)}</p>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                                        Ingredientes
                                    </h3>
                                    <span className="text-xs font-bold text-slate-400">
                                        {ingredients.length ? `${ingredients.length} elementos` : "Sin detalle"}
                                    </span>
                                </div>

                                {ingredients.length ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {ingredients.map((ingredient) => (
                                            <span
                                                key={ingredient}
                                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                                            >
                                                {ingredient}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                                        Este plato no tiene ingredientes visibles en la data actual.
                                    </p>
                                )}
                            </div>

                            <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">
                                        Cantidad
                                    </p>
                                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-700 transition hover:bg-orange-100 hover:text-orange-600"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center text-lg font-black text-slate-950">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((current) => current + 1)}
                                            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-orange-500"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onAdd?.(dish, quantity)}
                                    className="flex w-full items-center justify-between rounded-[1.6rem] bg-slate-950 px-5 py-4 text-left text-white shadow-xl shadow-slate-200 transition hover:bg-orange-500"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/12">
                                            <ShoppingBag className="h-5 w-5" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-black uppercase tracking-[0.18em]">
                                                Agregar
                                            </span>
                                            <span className="block text-xs text-white/70">
                                                {quantity} {quantity === 1 ? "unidad" : "unidades"} al carrito
                                            </span>
                                        </span>
                                    </span>
                                    <span className="text-xl font-black">Q{total.toFixed(2)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
