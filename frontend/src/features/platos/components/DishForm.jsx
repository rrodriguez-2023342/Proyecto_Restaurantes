import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { adminTheme } from "../../../constants/theme";
import { FormField } from "../../../shared/components";
import { useInventoryStore } from "../../inventory/store/useInventoryStore";

export const DishForm = ({ onSubmit, onCancel, menus = [], defaultValues = {}, isEditing = false, isLoading = false, restaurantId = "" }) => {
    const { inventarios, fetchInventarios, clearInventarios } = useInventoryStore();

    const parseIngredients = (ingredients) => {
        if (!ingredients) return [];
        if (Array.isArray(ingredients)) return ingredients;
        try {
            return typeof ingredients === "string" ? JSON.parse(ingredients) : [];
        } catch (error) {
            console.error("Error parsing ingredients:", error);
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
            ingredients: "",
        },
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
        const finalIngredients = selectedIngredients.filter((ingredient) => ingredient.itemInventario && ingredient.cantidad > 0);
        onSubmit?.({ ...values, ingredients: JSON.stringify(finalIngredients) });
        if (!isEditing) {
            reset();
            setSelectedIngredients([]);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nombre del plato" error={errors.name?.message}>
                    <input
                        {...register("name", { required: "El nombre es obligatorio" })}
                        className={`w-full ${adminTheme.input}`}
                        placeholder="Ej. Plato especial"
                    />
                </FormField>
                <FormField label="Precio (Q)" error={errors.price?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("price", { required: "El precio es obligatorio" })}
                        className={`w-full ${adminTheme.input}`}
                        placeholder="0.00"
                    />
                </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Menu" error={errors.menuId?.message}>
                    <select {...register("menuId", { required: "El menu es obligatorio" })} className={`w-full ${adminTheme.select}`}>
                        <option value="">Selecciona un menu</option>
                        {menus.map((menu) => (
                            <option key={menu._id || menu.id} value={menu._id || menu.id}>
                                {menu.nombreMenu || menu.nombre}
                            </option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Tipo de plato" error={errors.type?.message}>
                    <select {...register("type", { required: "El tipo es obligatorio" })} className={`w-full ${adminTheme.select}`}>
                        <option value="">Selecciona</option>
                        <option value="ENTRADA">Entrada</option>
                        <option value="PLATO_FUERTE">Plato fuerte</option>
                        <option value="POSTRE">Postre</option>
                        <option value="BEBIDA">Bebida</option>
                    </select>
                </FormField>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
                        Ingredientes
                    </label>
                    <button type="button" onClick={handleAddIngredient} className={adminTheme.outlineButton}>
                        + Agregar ingrediente
                    </button>
                </div>

                {selectedIngredients.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center">
                        <p className="text-sm font-semibold text-slate-500">No hay ingredientes vinculados.</p>
                    </div>
                )}

                {selectedIngredients.map((ingredient, index) => (
                    <div key={index} className="grid gap-2 animate-in fade-in slide-in-from-left-2 duration-200 sm:grid-cols-[minmax(0,1fr)_110px_auto]">
                        <select
                            value={ingredient.itemInventario?._id || ingredient.itemInventario}
                            onChange={(event) => handleIngredientChange(index, "itemInventario", event.target.value)}
                            className={`w-full ${adminTheme.select}`}
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
                            value={ingredient.cantidad}
                            onChange={(event) => handleIngredientChange(index, "cantidad", parseFloat(event.target.value))}
                            placeholder="Cant."
                            className={`w-full ${adminTheme.input}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-rose-700 active:scale-[0.98]"
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>

            <FormField label="Descripcion">
                <textarea
                    {...register("description")}
                    rows={3}
                    className={`w-full resize-none ${adminTheme.input}`}
                    placeholder="Describe el plato..."
                />
            </FormField>

            <FormField label="Imagen del plato">
                <input
                    type="file"
                    accept="image/*"
                    {...register("photo")}
                    className="w-full rounded-xl border border-dashed border-amber-500/40 bg-white px-4 py-3 text-sm font-semibold text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.18em] file:text-white"
                />
            </FormField>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className={adminTheme.neutralButton}>
                        Cancelar
                    </button>
                )}
                <button type="submit" disabled={isLoading} className={adminTheme.primaryButton}>
                    {isLoading ? "Guardando..." : isEditing ? "Actualizar plato" : "Crear plato"}
                </button>
            </div>
        </form>
    );
};
