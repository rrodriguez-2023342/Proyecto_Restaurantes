import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";
import { createReview, getReviews, updateReview } from "../../../shared/api/reviews";
import { useAuthStore } from "../../../shared/store/authStore";
import { useToast } from "../../../shared/components/Toast";

const getList = (data, key) => data?.data || data?.[key] || data || [];
const getId = (value) => value?._id || value?.id || value;

const getAuthorId = (review) => {
    if (typeof review?.usuario === "string") return review.usuario;
    return review?.usuario?._id || review?.usuario?.id || review?.usuario?.uid || null;
};

const getAuthorName = (review) => {
    if (typeof review?.usuario === "object" && review.usuario) {
        return [review.usuario.nombre || review.usuario.name, review.usuario.apellido || review.usuario.surname]
            .filter(Boolean)
            .join(" ") || review.usuario.username || "Comensal";
    }

    return "Comensal";
};

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString("es-GT", {
            timeZone: "America/Guatemala",
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "Reciente";

const RestaurantReviewsScreen = ({ navigation, route }) => {
    const restaurant = route.params?.restaurant;
    const restaurantId = route.params?.restaurantId || getId(restaurant);
    const restaurantName = restaurant?.nombre || restaurant?.name || "Restaurante";
    const user = useAuthStore((state) => state.user);
    const currentUserId = String(user?._id || user?.id || user?.uid || "");
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const ownReview = useMemo(
        () => reviews.find((review) => currentUserId && String(getAuthorId(review)) === currentUserId),
        [currentUserId, reviews]
    );
    const isEditing = Boolean(ownReview);

    const loadReviews = useCallback(async ({ refresh = false } = {}) => {
        if (!restaurantId) return;

        try {
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError("");

            const { data } = await getReviews({ restaurante: restaurantId, limit: 100 });
            setReviews(getList(data, "resenas"));
        } catch (err) {
            setError(err.response?.data?.message || "No se pudieron cargar los comentarios.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        loadReviews().catch(() => null);
    }, [loadReviews]);

    useEffect(() => {
        if (ownReview) {
            setRating(Number(ownReview.calificacion || ownReview.rating || 0));
            setComment(ownReview.comentario || ownReview.comment || "");
        } else {
            setRating(0);
            setComment("");
        }
        setSubmitted(false);
    }, [ownReview]);

    const handleSubmit = async () => {
        setSubmitted(true);
        setError("");

        if (!rating || comment.trim().length < 10) {
            return;
        }

        const payload = {
            restaurante: restaurantId,
            calificacion: rating,
            comentario: comment.trim(),
        };

        try {
            setSaving(true);
            if (isEditing) {
                await updateReview(getId(ownReview), {
                    calificacion: rating,
                    comentario: comment.trim(),
                });
                showToast({ type: "success", title: "Comentario actualizado", message: "Tu reseña fue guardada." });
            } else {
                await createReview(payload);
                showToast({ type: "success", title: "Comentario creado", message: "Gracias por compartir tu experiencia." });
            }
            await loadReviews({ refresh: true });
        } catch (err) {
            const message = err.response?.data?.message || "No se pudo guardar tu comentario.";
            setError(message);
            showToast({ type: "error", title: "No se pudo guardar", message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
                    <Ionicons name="chevron-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                    <Text style={styles.kicker}>Comentarios</Text>
                    <Text style={styles.title} numberOfLines={1}>{restaurantName}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.stateText}>Cargando comentarios...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadReviews({ refresh: true })}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>{isEditing ? "Modificar mi comentario" : "Crear mi comentario"}</Text>
                        <Text style={styles.formSubtitle}>
                            {isEditing ? "Ya comentaste este restaurante. Puedes editar tu reseña cuando quieras." : "Solo puedes crear un comentario por restaurante."}
                        </Text>

                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
                                    <Ionicons
                                        name={rating >= star ? "star" : "star-outline"}
                                        size={32}
                                        color={rating >= star ? COLORS.primary : "#cbd5e1"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {submitted && !rating ? <Text style={styles.fieldError}>Selecciona una calificacion.</Text> : null}

                        <TextInput
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Escribe como fue tu experiencia..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            maxLength={500}
                            style={[styles.commentInput, submitted && comment.trim().length < 10 && styles.inputError]}
                        />
                        <Text style={styles.counterText}>{comment.length}/500</Text>
                        {submitted && comment.trim().length < 10 ? <Text style={styles.fieldError}>El comentario debe tener al menos 10 caracteres.</Text> : null}

                        <TouchableOpacity
                            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={saving}
                            activeOpacity={0.9}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send-outline" size={18} color="#fff" />
                                    <Text style={styles.submitButtonText}>{isEditing ? "GUARDAR CAMBIOS" : "PUBLICAR COMENTARIO"}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Opiniones de clientes</Text>
                        <Text style={styles.listCount}>{reviews.length} comentarios</Text>
                    </View>

                    {reviews.length > 0 ? (
                        reviews.map((review) => {
                            const isOwner = currentUserId && String(getAuthorId(review)) === currentUserId;
                            return <ReviewCard key={String(getId(review))} review={review} isOwner={isOwner} />;
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-ellipses-outline" size={34} color={COLORS.primary} />
                            <Text style={styles.emptyTitle}>Aun no hay comentarios</Text>
                            <Text style={styles.emptySubtitle}>Se el primero en compartir tu experiencia.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const ReviewCard = ({ review, isOwner }) => {
    const rating = Number(review.calificacion || review.rating || 0);

    return (
        <View style={[styles.reviewCard, isOwner && styles.reviewCardOwn]}>
            <View style={styles.reviewTop}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getAuthorName(review).slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.reviewAuthor}>
                    <Text style={styles.authorName} numberOfLines={1}>{isOwner ? "Tu comentario" : getAuthorName(review)}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                {isOwner ? <Text style={styles.ownerBadge}>EDITABLE</Text> : null}
            </View>

            <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={rating >= star ? "star" : "star-outline"}
                        size={16}
                        color={rating >= star ? COLORS.primary : "#cbd5e1"}
                    />
                ))}
            </View>
            <Text style={styles.reviewComment}>{review.comentario || review.comment}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerCopy: {
        flex: 1,
    },
    kicker: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: "900",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        color: COLORS.text,
        fontSize: 21,
        fontWeight: "900",
        marginTop: 2,
    },
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    stateText: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "700",
    },
    content: {
        padding: 16,
        paddingBottom: 34,
        gap: 14,
    },
    errorText: {
        color: "#991b1b",
        backgroundColor: "#fff1f2",
        borderRadius: 14,
        padding: 12,
        fontWeight: "700",
    },
    formCard: {
        backgroundColor: "#fff",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 16,
        gap: 12,
    },
    formTitle: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: "900",
    },
    formSubtitle: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 18,
    },
    starsRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 8,
    },
    commentInput: {
        minHeight: 112,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        color: COLORS.text,
        padding: 12,
        textAlignVertical: "top",
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 20,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    counterText: {
        alignSelf: "flex-end",
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "700",
    },
    fieldError: {
        color: COLORS.error,
        fontSize: 11,
        fontWeight: "800",
    },
    submitButton: {
        minHeight: 50,
        borderRadius: 15,
        backgroundColor: COLORS.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1.1,
    },
    listHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 4,
    },
    listTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
    },
    listCount: {
        color: COLORS.textLight,
        fontSize: 12,
        fontWeight: "800",
    },
    reviewCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 15,
        gap: 10,
    },
    reviewCardOwn: {
        borderColor: "#fed7aa",
        backgroundColor: "#fffaf5",
    },
    reviewTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primaryDark,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
    },
    reviewAuthor: {
        flex: 1,
    },
    authorName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "900",
    },
    reviewDate: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "700",
        marginTop: 2,
    },
    ownerBadge: {
        color: COLORS.accent,
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 5,
        fontSize: 9,
        fontWeight: "900",
    },
    reviewStars: {
        flexDirection: "row",
        gap: 3,
    },
    reviewComment: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 26,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#fed7aa",
        backgroundColor: "#fff",
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "900",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textLight,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
    },
});

export default RestaurantReviewsScreen;
