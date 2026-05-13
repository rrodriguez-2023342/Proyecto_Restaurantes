import React from "react";
import { Star } from "lucide-react";
import { useReviewStore } from "../../store/useReviewStore";
import SkeletonLoader from "../../../shared/components/SkeletonLoader";

const ReviewList = ({ restaurantId }) => {
  const { reviews, loading, error, fetchReviews } = useReviewStore();

  // Fetch reviews for the restaurant when the component mounts or restaurantId changes
  React.useEffect(() => {
    if (restaurantId) {
      fetchReviews({ restaurante: restaurantId });
    }
  }, [restaurantId, fetchReviews]);

  if (loading && !reviews.length) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton for a list of reviews */}
        <div className="flex items-start space-x-3">
          <SkeletonLoader width="8" height="8" circle className="mt-0.5" />
          <div className="space-y-2">
            <SkeletonLoader width="full" height="4" className="w-32" />
            <SkeletonLoader width="full" height="4" className="w-24" />
          </div>
        </div>
        {/* Repeat skeleton a few times to simulate a list */}
        <div className="flex items-start space-x-3">
          <SkeletonLoader width="8" height="8" circle className="mt-0.5" />
          <div className="space-y-2">
            <SkeletonLoader width="full" height="4" className="w-40" />
            <SkeletonLoader width="full" height="4" className="w-32" />
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <SkeletonLoader width="8" height="8" circle className="mt-0.5" />
          <div className="space-y-2">
            <SkeletonLoader width="full" height="4" className="w-32" />
            <SkeletonLoader width="full" height="4" className="w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-center text-gray-500 py-8">No hay reseñas todavía. Sé el primero en dejar una opinión.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id || review.id} className="border-t pt-4 last:border-0 last:pb-0">
          <div className="flex items-start space-x-3">
            {/* Reviewer Avatar (using SkeletonLoader for now, but could be replaced with actual avatar) */}
            <SkeletonLoader width="8" height="8" circle className="mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-between justify-between">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={review.rating >= star ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {/* Assuming review has a createdAt field */}
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;