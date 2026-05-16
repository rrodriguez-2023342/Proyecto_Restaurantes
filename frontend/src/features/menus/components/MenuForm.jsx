import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "../../../shared/components";

const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
        return src;
    }
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    if (base) return `${base}${src}`;
    return src;
};

const buildDefaults = (menu, restaurants = []) => ({
    name: menu?.nombreMenu || "",
    description: menu?.descripcionMenu || "",
    restaurantId: menu?.restaurante?._id || menu?.restaurante?.id || menu?.restaurante || (restaurants.length === 1 ? restaurants[0]._id || restaurants[0].id : ""),
    active: menu?.isActive ?? true,
});

export const MenuForm = ({ defaultValues, onSubmit, onCancel, isLoading, restaurants = [] }) => {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({ defaultValues: buildDefaults(defaultValues, restaurants) });

    const photoFile = useWatch({ control, name: "photo" });
    const previewUrl = useMemo(() => {
        if (!photoFile || !photoFile.length) return null;
        return URL.createObjectURL(photoFile[0]);
    }, [photoFile]);

    const existingImage = useMemo(() => {
        if (!defaultValues?.fotoMenu) return null;
        return resolveImageSrc(defaultValues.fotoMenu);
    }, [defaultValues?.fotoMenu]);

    useEffect(() => {
        reset(buildDefaults(defaultValues, restaurants));
    }, [defaultValues, restaurants, reset]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Nombre del menu" error={errors.name?.message}>
                <input
                    {...register("name", { required: "El nombre es obligatorio" })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>
            <FormField label="Descripcion" error={errors.description?.message}>
                <textarea
                    {...register("description", { required: "La descripcion es obligatoria" })}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Restaurante" error={errors.restaurantId?.message}>
                    {restaurants.length ? (
                        <select
                            {...register("restaurantId", { required: "El restaurante es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="">Selecciona un restaurante</option>
                            {restaurants.map((restaurant) => (
                                <option key={restaurant._id || restaurant.id} value={restaurant._id || restaurant.id}>
                                    {restaurant.nombre}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            {...register("restaurantId", { required: "El restaurante es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                            placeholder="ID del restaurante"
                        />
                    )}
                </FormField>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" {...register("active")} className="h-4 w-4" />
                    Menu activo
                </label>
            </div>

            <FormField label="Imagen del menu (opcional)">
                <div className="flex flex-col gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        {...register("photo")}
                        className="w-full rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-3 text-sm text-slate-600"
                    />
                    {previewUrl ? (
                        <div className="relative group">
                            <img
                                src={previewUrl}
                                alt="Preview menu"
                                className="h-48 w-full rounded-2xl object-cover border-2 border-orange-200"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-2xl">
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-orange-600">Nueva imagen</span>
                            </div>
                        </div>
                    ) : existingImage ? (
                        <img
                            src={existingImage}
                            alt="Imagen actual"
                            className="h-48 w-full rounded-2xl object-cover border border-slate-200"
                        />
                    ) : (
                        <div className="h-32 w-full rounded-2xl bg-orange-50 border border-dashed border-orange-200 flex items-center justify-center">
                            <span className="text-orange-300 text-xs font-medium">Sin imagen seleccionada</span>
                        </div>
                    )}
                </div>
            </FormField>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition disabled:opacity-60"
                >
                    {defaultValues ? "Guardar cambios" : "Crear menú"}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};
