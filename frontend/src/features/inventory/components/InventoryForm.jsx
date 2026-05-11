import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "../../../shared/components";

export const InventoryForm = ({ onSubmit, defaultValues = {}, isEditing = false, isLoading = false, restaurants = [] }) => {
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
        if (!isEditing) reset();
    };

    return (
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
            {restaurants.length > 0 && (
                <FormField label="Restaurante" error={errors.restaurante?.message}>
                    <select
                        {...register("restaurante", { required: "Debes seleccionar un restaurante" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Selecciona un restaurante...</option>
                        {restaurants.map((r) => (
                            <option key={r._id || r.id} value={r._id || r.id}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>
                </FormField>
            )}

            <FormField label="Nombre del item" error={errors.nombreItem?.message}>
                <input
                    {...register("nombreItem", { required: "El nombre es obligatorio" })}
                    placeholder="Ej: Harina de trigo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>
            
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Cantidad actual" error={errors.cantidad?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("cantidad", { 
                            required: "La cantidad es obligatoria",
                            min: { value: 0, message: "No puede ser negativa" }
                        })}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                </FormField>
                
                <FormField label="Stock Mínimo (Alerta)" error={errors.minStock?.message}>
                    <input
                        type="number"
                        step="0.01"
                        {...register("minStock", { 
                            required: "El stock mínimo es obligatorio",
                            min: { value: 0, message: "No puede ser negativa" }
                        })}
                        placeholder="5.00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                </FormField>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:shadow-xl hover:shadow-orange-300 disabled:opacity-60"
            >
                {isLoading ? "Procesando..." : isEditing ? "Actualizar ítem" : "Agregar al inventario"}
            </button>
        </form>
    );
};
