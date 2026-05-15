import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useReviewStore } from "../store/useReviewStore";
import { useAuthStore } from "../../auth/store/authStore";
import { showError, showSuccess } from "../../../shared/utils/toast";

export const ReviewForm = ({ restaurantId, initialData = null, onCancelEdit = null }) => {
    const { createReview, updateReview, loading } = useReviewStore();
    const user = useAuthStore((state) => state.user);
    const isEditing = !!initialData;
    
    const [hoveredStar, setHoveredStar] = useState(0);
    
    const { 
        register, 
        handleSubmit, 
        reset, 
        setValue, 
        watch,
        formState: { errors } 
    } = useForm({
        values: initialData ? {
            rating: initialData.calificacion || initialData.rating || 0,
            comment: initialData.comentario || initialData.comment || "",
        } : {
            rating: 0,
            comment: "",
        },
    });

    const currentRating = watch("rating");

    const onSubmit = async (data) => {
        if (data.rating === 0) {
            showError("Por favor selecciona una calificación");
            return;
        }

        try {
            if (isEditing) {
                await updateReview(initialData._id || initialData.id, {
                    calificacion: data.rating,
                    comentario: data.comment,
                });
                showSuccess("Reseña actualizada");
                if (onCancelEdit) onCancelEdit();
            } else {
                await createReview({
                    calificacion: data.rating,
                    comentario: data.comment,
                    restaurante: restaurantId,
                });
                showSuccess("¡Gracias por tu reseña!");
                reset();
            }
        } catch (err) {
            showError(err.response?.data?.message || "Hubo un error al procesar la reseña");
        }
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isEditing ? "Edita tu opinión" : "Tu opinión importa"}
                    </h3>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                        {isEditing ? "Modificando" : "¿Qué tal fue tu experiencia?"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex justify-center py-6">
                    <div className="flex items-center gap-4">
                        {stars.map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setValue("rating", star, { shouldValidate: true })}
                                className="transition-transform active:scale-90"
                            >
                                <Star
                                    size={32}
                                    className={`transition-all duration-300 ${
                                        (hoveredStar || currentRating) >= star
                                            ? "text-amber-500 fill-amber-500"
                                            : "text-slate-200"
                                    }`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        {...register("comment", {
                            required: "Cuéntanos un poco más sobre tu experiencia",
                            minLength: { value: 10, message: "El comentario es muy corto" }
                        })}
                        placeholder="Escribe aquí tu reseña..."
                        rows={4}
                        className={`w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 ${
                            errors.comment ? "border-red-300 bg-red-50" : ""
                        }`}
                    />
                    {errors.comment && (
                        <p className="mt-1.5 text-xs font-bold text-red-500 pl-1">{errors.comment.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-70"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <>
                            <Send size={16} />
                            {isEditing ? "Guardar Cambios" : "Publicar Reseña"}
                        </>
                    )}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest mt-2"
                    >
                        Cancelar Edición
                    </button>
                )}
            </form>
        </div>
    );
};

export default ReviewForm;