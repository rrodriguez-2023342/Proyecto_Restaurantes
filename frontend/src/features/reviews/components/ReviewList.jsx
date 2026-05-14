import React, { useEffect } from "react";
import { Star, MessageSquareOff } from "lucide-react";
import { useReviewStore } from "../store/useReviewStore";
import SkeletonLoader from "../../../shared/components/SkeletonLoader";
import { Avatar, EmptyState } from "../../../shared/components";
import { useAuthStore } from "../../auth/store/authStore";
import { showError, showSuccess } from "../../../shared/utils/toast";
import Swal from "sweetalert2";

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

export const ReviewList = ({ restaurantId, onEdit }) => {
    const { reviews, loading, error, fetchReviews, deleteReview } = useReviewStore();
    const currentUser = useAuthStore((state) => state.user);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "¿Eliminar reseña?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await deleteReview(id);
                showSuccess("Reseña eliminada");
            } catch (err) {
                showError("No se pudo eliminar la reseña");
            }
        }
    };

    useEffect(() => {
        if (restaurantId) {
            fetchReviews({ restaurante: restaurantId });
        }
    }, [restaurantId, fetchReviews]);

    if (loading && !reviews.length) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded-full bg-slate-100" />
                                <div className="h-3 w-20 rounded-full bg-slate-50" />
                            </div>
                        </div>
                        <div className="mt-4 h-4 w-full rounded-full bg-slate-50" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
                Hubo un error al cargar las reseñas: {error}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <EmptyState
                title="Aún no hay reseñas"
                description="Sé el primero en compartir tu experiencia en este restaurante."
                icon={<MessageSquareOff size={40} className="text-slate-300" />}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Opiniones de clientes</h3>
                    <p className="text-sm text-slate-500 font-medium">Lo que otros comensales dicen de este lugar.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">
                        {reviews.length} {reviews.length === 1 ? "Reseña" : "Reseñas"}
                    </span>
                    {currentUser && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Viendo como: <span className="text-orange-500">{currentUser.nombre || currentUser.username}</span>
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {reviews.map((review, idx) => (
                    <article 
                        key={review._id || review.id} 
                        className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
                        style={{ animation: 'fadeUp 0.5s ease-out both', animationDelay: `${idx * 100}ms` }}
                    >
                        <style>{`
                            @keyframes fadeUp {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar 
                                    name={review.usuario?.nombre || review.usuario?.name || review.usuario?.username || "Usuario"}
                                    src={review.usuario?.profilePicture}
                                    size={48}
                                    className="border-2 border-white shadow-md"
                                />
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        {review.usuario?.nombre || review.usuario?.name 
                                            ? `${review.usuario.nombre || review.usuario.name} ${review.usuario.apellido || review.usuario.surname || ""}` 
                                            : review.usuario?.username || "Comensal Anónimo"}
                                    </h4>
                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                        {review.createdAt ? formatDate(review.createdAt) : "Reciente"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const ratingValue = review.calificacion || review.rating;
                                        return (
                                            <Star
                                                key={star}
                                                size={14}
                                                className={ratingValue >= star ? "text-orange-500" : "text-slate-200"}
                                                fill={ratingValue >= star ? "currentColor" : "none"}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Edit / Delete Actions */}
                                {(() => {
                                    const currentId = currentUser?._id || currentUser?.id;
                                    const ownerId = review.usuario?._id || review.usuario?.id || (typeof review.usuario === 'string' ? review.usuario : null);
                                    
                                    return currentId && ownerId && currentId === ownerId;
                                })() && (
                                    <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                                        <button 
                                            onClick={() => onEdit(review)}
                                            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                            title="Editar"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(review._id || review.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Eliminar"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 relative">
                            <span className="absolute -left-1 -top-1 text-4xl text-slate-50 font-serif opacity-50 select-none">"</span>
                            <p className="relative z-10 text-sm leading-relaxed text-slate-600 italic">
                                {review.comentario || review.comment}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default ReviewList;