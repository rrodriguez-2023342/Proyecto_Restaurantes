import React from "react";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { useReviewStore } from "../../store/useReviewStore";
import { toast } from "react-hot-toast";

const ReviewForm = ({ restaurantId }) => {
  const { createReview, loading, error } = useReviewStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await createReview({
        ...data,
        restaurante: restaurantId, // Assuming the API expects this field
      });
      toast.success("Reseña creada exitosamente");
      reset();
    } catch (err) {
      toast.error(error || "Error al crear la reseña");
    }
  };

  const stars = [1, 2, 3, 4, 5];
  const handleRatingClick = (rating) => {
    // Update the form's rating value
    reset({ rating, comment: formState.values.comment || "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Calificación:</span>
        <div className="flex items-center">
          {stars.map((star) => (
            <Star
              key={star}
              size={20}
              className={`cursor-pointer text-gray-300 hover:text-yellow-400 ${
                formState.values.rating >= star ? "text-yellow-400" : ""
              }`}
              onClick={() => handleRatingClick(star)}
            />
          ))}
        </span>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Comentario
        </label>
        <textarea
          id="comment"
          {...register("comment", {
            required: "El comentario es requerido",
            maxLength: {
              value: 500,
              message: "Máximo 500 caracteres",
            },
          })}
          className={`
            w-full
            px-3
            py-2
            border
            border-gray-300
            rounded-md
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            ${errors.comment ? "border-red-500" : ""}
          `}
          rows={3}
          placeholder="Escribe tu comentario..."
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`
          w-full
          bg-blue-600
          text-white
          py-2
          px-4
          rounded-md
          hover:bg-blue-700
          transition
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {loading ? "Publicando..." : "Publicar reseña"}
      </button>
    </form>
  );
};

export default ReviewForm;