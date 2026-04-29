import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "../../../shared/components";

const CATEGORY_OPTIONS = [
    "Italiana",
    "Mexicana",
    "Guatemalteca",
    "Americana",
    "China",
    "Japonesa",
    "Francesa",
    "Mariscos",
    "Vegetariana",
    "Cafetería",
    "Panadería",
    "Fusión",
    "Otro",
];

const CITY_OPTIONS = [
    "Guatemala",
    "Mixco",
    "Villa Nueva",
    "Antigua Guatemala",
    "Quetzaltenango",
    "Escuintla",
    "Chimaltenango",
    "San Lucas",
    "Amatitlan",
    "Villa Canales",
];

const STREET_OPTIONS = [
    "Calle 10, Zona 1",
    "Avenida Las Americas, Zona 14",
    "Calzada Roosevelt, Zona 7",
    "Boulevard Liberacion, Zona 13",
    "Avenida Reforma, Zona 9",
    "Ruta 6, Zona 4",
    "Km 16.5 Carretera a El Salvador",
    "Calle Marti, Zona 6",
];

const DAY_OPTIONS = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
        return src;
    }
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    if (base) return `${base}${src}`;
    return src;
};

const buildDefaults = (restaurant) => ({
    name: restaurant?.nombre || "",
    description: restaurant?.descripcion || "",
    category: restaurant?.categoria || "",
    phone: restaurant?.telefono || "",
    city: restaurant?.direccion?.ciudad || "",
    street: restaurant?.direccion?.calle || "",
    active: restaurant?.isActive ?? true,
    openingTime: restaurant?.horario?.apertura || "",
    closingTime: restaurant?.horario?.cierre || "",
    openDays: restaurant?.horario?.diasAbierto || [],
});

export const RestaurantForm = ({ defaultValues, onSubmit, onCancel, isLoading, owners = [] }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm({ defaultValues: buildDefaults(defaultValues) });

    const photoFile = useWatch({ control, name: "photo" });
    const previewUrl = useMemo(() => {
        if (!photoFile || !photoFile.length) return null;
        return URL.createObjectURL(photoFile[0]);
    }, [photoFile]);

    const existingImage = useMemo(() => {
        if (!defaultValues?.fotos) return null;
        return resolveImageSrc(defaultValues.fotos);
    }, [defaultValues?.fotos]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        reset(buildDefaults(defaultValues));
    }, [defaultValues, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!defaultValues && (
                <FormField label="Dueño (ID de usuario)" error={errors.ownerId?.message}>
                    {owners && owners.length > 0 ? (
                        <select
                            {...register('ownerId', { required: 'El dueño es obligatorio' })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="">Selecciona un dueño</option>
                            {owners.map((o) => (
                                <option key={o.id || o._id} value={o.id || o._id}>
                                    {o.name} {o.surname} ({o.username})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            {...register('ownerId', { required: 'El dueño es obligatorio' })}
                            placeholder="ID del usuario dueño"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        />
                    )}
                </FormField>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Nombre" error={errors.name?.message}>
                    <input
                        {...register("name", { required: "El nombre es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="Restaurante"
                    />
                </FormField>
                <FormField label="Categoria" error={errors.category?.message}>
                    <select
                        {...register("category", { required: "La categoria es obligatoria" })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Selecciona una categoria</option>
                        {CATEGORY_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <FormField label="Imagen del restaurante">
                <div className="flex flex-col gap-3">
                    <input
                        type="file"
                        accept="image/*"
                        {...register("photo")}
                        className="w-full rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-3 text-sm text-slate-600"
                    />
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-40 w-full rounded-2xl object-cover"
                        />
                    ) : existingImage ? (
                        <img
                            src={existingImage}
                            alt="Imagen actual"
                            className="h-40 w-full rounded-2xl object-cover"
                        />
                    ) : null}
                </div>
            </FormField>

            <FormField label="Descripcion" error={errors.description?.message}>
                <textarea
                    {...register("description", { required: "La descripcion es obligatoria" })}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Telefono" error={errors.phone?.message}>
                    <input
                        {...register("phone", { required: "El telefono es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="55551234"
                    />
                </FormField>
                <FormField label="Ciudad" error={errors.city?.message}>
                    <input
                        {...register("city", { required: "La ciudad es obligatoria" })}
                        list="city-options"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="Guatemala"
                    />
                    <datalist id="city-options">
                        {CITY_OPTIONS.map((item) => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>
                </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Hora apertura">
                    <input
                        type="time"
                        {...register("openingTime")}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                </FormField>
                <FormField label="Hora cierre">
                    <input
                        type="time"
                        {...register("closingTime")}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    />
                </FormField>
            </div>

            <FormField label="Dias de atencion">
                <div className="grid gap-2 sm:grid-cols-2">
                    {DAY_OPTIONS.map((day) => (
                        <label key={day} className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                value={day}
                                {...register("openDays")}
                                className="h-4 w-4"
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </FormField>

            <FormField label="Direccion" error={errors.street?.message}>
                <input
                    {...register("street", { required: "La direccion es obligatoria" })}
                    list="street-options"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    placeholder="Calle 10, zona 1"
                />
                <datalist id="street-options">
                    {STREET_OPTIONS.map((item) => (
                        <option key={item} value={item} />
                    ))}
                </datalist>
            </FormField>

            <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" {...register("active")} className="h-4 w-4" />
                Restaurante activo
            </label>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-orange-500 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition disabled:opacity-60"
                >
                    {defaultValues ? "Guardar cambios" : "Crear restaurante"}
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
