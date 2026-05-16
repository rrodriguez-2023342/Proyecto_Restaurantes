import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { adminTheme } from "../../../constants/theme";
import { FormField } from "../../../shared/components";

export const InventoryForm = ({ onSubmit, onCancel, defaultValues = {}, isEditing = false, isLoading = false, restaurants = [] }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const handleCreate = (values) => {
        onSubmit?.(values);
        if (!isEditing) reset(defaultValues);
    };

    return (
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
            {restaurants.length > 0 && (
                <FormField label="Restaurante" error={errors.restaurante?.message}>
                    <select
                        {...register("restaurante", { required: "Debes seleccionar un restaurante" })}
                        className={`w-full ${adminTheme.select}`}
                    >
                        <option value="">Selecciona un restaurante...</option>
                        {restaurants.map((restaurant) => (
                            <option key={restaurant._id || restaurant.id} value={restaurant._id || restaurant.id}>
                                {restaurant.nombre}
                            </option>
                        ))}
                    </select>
                </FormField>
            )}

            <FormField label="Nombre del item" error={errors.nombreItem?.message}>
                <input
                    {...register("nombreItem", { required: "El nombre es obligatorio" })}
                    placeholder="Ej: Harina de trigo"
                    className={`w-full ${adminTheme.input}`}
                />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Cantidad actual" error={errors.cantidad?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("cantidad", {
                            required: "La cantidad es obligatoria",
                            min: { value: 0, message: "No puede ser negativa" },
                        })}
                        placeholder="0.00"
                        className={`w-full ${adminTheme.input}`}
                    />
                </FormField>

                <FormField label="Stock minimo" error={errors.minStock?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("minStock", {
                            required: "El stock minimo es obligatorio",
                            min: { value: 0, message: "No puede ser negativa" },
                        })}
                        placeholder="5.00"
                        className={`w-full ${adminTheme.input}`}
                    />
                </FormField>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Alerta de stock</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    Cuando la existencia sea menor o igual al stock minimo, el item se marcara como stock bajo.
                </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className={adminTheme.neutralButton}>
                        Cancelar
                    </button>
                )}
                <button type="submit" disabled={isLoading} className={adminTheme.primaryButton}>
                    {isLoading ? "Procesando..." : isEditing ? "Actualizar item" : "Agregar al inventario"}
                </button>
            </div>
        </form>
    );
};
