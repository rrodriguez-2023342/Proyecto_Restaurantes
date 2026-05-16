import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "../../../shared/components";
import { useInventoryStore } from "../../inventory/store/useInventoryStore";

export const DishForm = ({ onSubmit, menus = [], defaultValues = {}, isEditing = false, isLoading = false, restaurantId = "" }) => {
    const { inventarios, fetchInventarios, clearInventarios } = useInventoryStore();
    const parseIngredients = (ingredients) => {
        if (!ingredients) return [];
        if (Array.isArray(ingredients)) return ingredients;
        try {
            return typeof ingredients === "string" ? JSON.parse(ingredients) : [];
        } catch (e) {
            console.error("Error parsing ingredients:", e);
            return [];
        }
    };

    const [selectedIngredients, setSelectedIngredients] = useState(parseIngredients(defaultValues.ingredients));
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ 
        defaultValues: {
            ...defaultValues,
            ingredients: "" // Limpiamos el campo de texto viejo
        } 
    });

    useEffect(() => {
        if (!restaurantId) {
            clearInventarios();
            return;
        }

        fetchInventarios(1, 50, restaurantId);
    }, [clearInventarios, fetchInventarios, restaurantId]);

    useEffect(() => {
        reset(defaultValues);
        setSelectedIngredients(parseIngredients(defaultValues.ingredients));
    }, [defaultValues, reset]);

    const handleAddIngredient = () => {
        setSelectedIngredients([...selectedIngredients, { itemInventario: "", cantidad: 0 }]);
    };

    const handleRemoveIngredient = (index) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...selectedIngredients];
        newIngredients[index][field] = value;
        setSelectedIngredients(newIngredients);
    };

    const handleCreate = (values) => {
        // Filtramos ingredientes vacíos o con cantidad 0
        const finalIngredients = selectedIngredients.filter(ing => ing.itemInventario && ing.cantidad > 0);
        onSubmit?.({ ...values, ingredients: JSON.stringify(finalIngredients) });
        if (!isEditing) {
            reset();
            setSelectedIngredients([]);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nombre del plato" error={errors.name?.message}>
                    <input
                        {...register("name", { required: "El nombre es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                </FormField>
                <FormField label="Precio (Q)" error={errors.price?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("price", { required: "El precio es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="0.00"
                    />
                </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Menú" error={errors.menuId?.message}>
                    <select
                        {...register("menuId", { required: "El menú es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Selecciona un menú</option>
                        {menus.map((menu) => (
                            <option key={menu._id || menu.id} value={menu._id || menu.id}>
                                {menu.nombreMenu || menu.nombre}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Tipo de plato" error={errors.type?.message}>
                    <select
                        {...register("type", { required: "El tipo es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Selecciona</option>
                        <option value="ENTRADA">Entrada</option>
                        <option value="PLATO_FUERTE">Plato fuerte</option>
                        <option value="POSTRE">Postre</option>
                        <option value="BEBIDA">Bebida</option>
                    </select>
                </FormField>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ingredientes (Descuento de Inventario)</label>
                    <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700"
                    >
                        + Agregar ingrediente
                    </button>
                </div>
                
                {selectedIngredients.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-2 italic">No hay ingredientes vinculados.</p>
                )}

                {selectedIngredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <select
                            value={ing.itemInventario?._id || ing.itemInventario}
                            onChange={(e) => handleIngredientChange(index, "itemInventario", e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="">Seleccionar ingrediente</option>
                            {inventarios.map((inv) => (
                                <option key={inv._id || inv.id} value={inv._id || inv.id}>
                                    {inv.nombreItem} ({inv.cantidad} disp.)
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            step="0.01"
                            value={ing.cantidad}
                            onChange={(e) => handleIngredientChange(index, "cantidad", parseFloat(e.target.value))}
                            placeholder="Cant."
                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-orange-400 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="rounded-xl bg-rose-50 px-3 text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <FormField label="Descripción">
                <textarea
                    {...register("description")}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    placeholder="Describe el plato..."
                />
            </FormField>

            <FormField label="Imagen del plato">
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        {...register("photo")}
                        className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-xs file:font-bold file:text-orange-700 hover:border-orange-300 transition-all cursor-pointer"
                    />
                </div>
            </FormField>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl hover:shadow-orange-300 disabled:opacity-60"
            >
                {isLoading ? "Guardando..." : isEditing ? "Actualizar Plato" : "Crear Plato"}
            </button>
        </form>
    );
};

