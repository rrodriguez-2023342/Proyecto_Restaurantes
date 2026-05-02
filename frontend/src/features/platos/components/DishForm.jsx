import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "../../../shared/components";

export const DishForm = ({ onSubmit, menus = [], defaultValues = {}, isEditing = false, isLoading = false }) => {
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
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-3">
            <FormField label="Nombre del plato" error={errors.name?.message}>
                <input
                    {...register("name", { required: "El nombre es obligatorio" })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>
            <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Precio" error={errors.price?.message}>
                    <input
                        {...register("price", { required: "El precio es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="Q 45.00"
                    />
                </FormField>
                <FormField label="Menu" error={errors.menuId?.message}>
                    {menus.length ? (
                        <select
                            {...register("menuId", { required: "El menu es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        >
                            <option value="">Selecciona un menu</option>
                            {menus.map((menu) => (
                                <option key={menu._id || menu.id} value={menu._id || menu.id}>
                                    {menu.nombreMenu || menu.nombre}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            {...register("menuId", { required: "El menu es obligatorio" })}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        />
                    )}
                </FormField>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Tipo de plato" error={errors.type?.message}>
                    <select
                        {...register("type", { required: "El tipo es obligatorio" })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                    >
                        <option value="">Selecciona</option>
                        <option value="ENTRADA">Entrada</option>
                        <option value="PLATO_FUERTE">Plato fuerte</option>
                        <option value="POSTRE">Postre</option>
                        <option value="BEBIDA">Bebida</option>
                    </select>
                </FormField>
                <FormField label="Ingredientes">
                    <input
                        {...register("ingredients")}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                        placeholder="Ej: pollo, queso, salsa"
                    />
                </FormField>
            </div>
            <FormField label="Descripcion">
                <textarea
                    {...register("description")}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                />
            </FormField>
            <FormField label="Imagen del plato">
                <input
                    type="file"
                    accept="image/*"
                    {...register("photo")}
                    className="w-full rounded-xl border border-dashed border-orange-200 bg-orange-50/30 px-4 py-2 text-sm text-slate-600"
                />
                {isEditing && (
                    <p className="mt-2 text-xs text-slate-500">
                        La imagen no se puede actualizar al editar en esta versión.
                    </p>
                )}
            </FormField>
            <button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isEditing ? "Guardar cambios" : "Agregar plato"}
            </button>
        </form>
    );
};
