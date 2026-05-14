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
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">
                        {isEditing ? "Modificando" : "Feedback"}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                        {isEditing ? "Edita tu opinión" : "Tu opinión importa"}
                    </h3>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <Star className="h-5 w-5 text-orange-500" fill="currentColor" />
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selector de Estrellas Premium */}
                <div className="flex flex-col items-center justify-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        ¿Qué tal estuvo tu experiencia?
                    </p>
                    <div className="flex items-center gap-2">
                        {stars.map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setValue("rating", star, { shouldValidate: true })}
                                className="group relative transition-transform active:scale-90"
                            >
                                <Star
                                    size={36}
                                    className={`transition-all duration-300 ${
                                        (hoveredStar || currentRating) >= star
                                            ? "text-orange-500"
                                            : "text-slate-200"
                                    }`}
                                    fill={(hoveredStar || currentRating) >= star ? "currentColor" : "none"}
                                    strokeWidth={2.5}
                                />
                                {(hoveredStar || currentRating) === star && (
                                    <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-orange-500" />
                                )}
                            </button>
                        ))}
                    </div>
                    {currentRating > 0 && (
                        <p className="mt-3 text-[10px] font-black text-orange-600 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                            {currentRating === 5 ? "¡Increíble!" : currentRating >= 4 ? "Muy bueno" : currentRating >= 3 ? "Normal" : "Pudo ser mejor"}
                        </p>
                    )}
                </div>

                <div className="relative">
                    <textarea
                        {...register("comment", {
                            required: "Cuéntanos un poco más sobre tu experiencia",
                            minLength: { value: 10, message: "El comentario es muy corto" }
                        })}
                        placeholder="Escribe aquí tu reseña..."
                        rows={4}
                        className={`w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
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
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-200 transition-all hover:bg-orange-500 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                        <>
                            <Send size={18} />
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