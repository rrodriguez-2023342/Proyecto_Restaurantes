import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { adminTheme } from "../../../constants/theme";
import { FormField } from "../../../shared/components";

const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) return src;
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    return base ? `${base}${src}` : src;
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField label="Nombre del menu" error={errors.name?.message}>
                <input
                    {...register("name", { required: "El nombre es obligatorio" })}
                    className={`w-full ${adminTheme.input}`}
                    placeholder="Ej. Menu de temporada"
                />
            </FormField>

            <FormField label="Descripcion" error={errors.description?.message}>
                <textarea
                    {...register("description", { required: "La descripcion es obligatoria" })}
                    rows={3}
                    className={`w-full resize-none ${adminTheme.input}`}
                    placeholder="Describe el enfoque del menu"
                />
            </FormField>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <FormField label="Restaurante" error={errors.restaurantId?.message}>
                    {restaurants.length ? (
                        <select
                            {...register("restaurantId", { required: "El restaurante es obligatorio" })}
                            className={`w-full ${adminTheme.select}`}
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
                            className={`w-full ${adminTheme.input}`}
                            placeholder="ID del restaurante"
                        />
                    )}
                </FormField>

                <label className="flex h-[46px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700">
                    <input type="checkbox" {...register("active")} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />
                    Menu activo
                </label>
            </div>

            <FormField label="Imagen del menu (opcional)">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <input
                        type="file"
                        accept="image/*"
                        {...register("photo")}
                        className="w-full rounded-xl border border-dashed border-amber-500/40 bg-white px-4 py-3 text-sm font-semibold text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.18em] file:text-white"
                    />
                    {previewUrl ? (
                        <div className="relative overflow-hidden rounded-xl border border-amber-500/40">
                            <img src={previewUrl} alt="Preview menu" className="h-48 w-full object-cover" />
                            <span className="absolute left-3 top-3 rounded-lg bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 shadow-lg">
                                Nueva imagen
                            </span>
                        </div>
                    ) : existingImage ? (
                        <img src={existingImage} alt="Imagen actual" className="h-48 w-full rounded-xl border border-slate-200 object-cover" />
                    ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Sin imagen seleccionada</span>
                        </div>
                    )}
                </div>
            </FormField>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button type="button" onClick={onCancel} className={adminTheme.neutralButton}>
                        Cancelar
                    </button>
                )}
                <button type="submit" disabled={isLoading} className={adminTheme.primaryButton}>
                    {isLoading ? "Guardando..." : defaultValues ? "Guardar cambios" : "Crear menu"}
                </button>
            </div>
        </form>
    );
};
