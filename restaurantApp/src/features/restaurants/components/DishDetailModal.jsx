import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../shared/constants/theme";

const getDishImage = (dish) => dish?.fotosPlato || dish?.fotos || dish?.image || null;
const getDishName = (dish) => dish?.nombrePlato || dish?.nombre || "Plato";
const getDishDescription = (dish) =>
    dish?.descripcionPlato || dish?.descripcion || "Preparacion especial de la casa.";
const getDishPrice = (dish) => Number(dish?.precio || 0);

const getIngredientNames = (dish) => {
    const list = dish?.ingredientes;
    if (!Array.isArray(list)) return [];
    return list
        .map((ing) => {
            if (typeof ing === "string") return ing;
            return (
                ing?.nombre ||
                ing?.nombreItem ||
                ing?.itemInventario?.nombreItem ||
                ing?.itemInventario?.nombre ||
                null
            );
        })
        .filter(Boolean);
};

const DishDetailModal = ({ visible, dish, onClose, onAdd }) => {
    const [quantity, setQuantity] = useState(1);
    const [notas, setNotas] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (visible) {
            setQuantity(1);
            setNotas("");
            setIsAdding(false);
        }
    }, [visible, dish]);

    if (!dish) return null;

    const image = getDishImage(dish);
    const name = getDishName(dish);
    const description = getDishDescription(dish);
    const price = getDishPrice(dish);
    const ingredients = getIngredientNames(dish);
    const total = price * quantity;

    const handleAdd = () => {
        if (isAdding) return;
        const added = onAdd?.(quantity, notas.trim());
        if (added === false) {
            onClose?.();
            return;
        }
        setIsAdding(true);
        setTimeout(() => {
            setIsAdding(false);
            onClose?.();
        }, 650);
    };

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <ScrollView
                        style={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.body}
                    >
                        <View style={styles.imageWrap}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.image} />
                            ) : (
                                <View style={styles.imageFallback}>
                                    <Ionicons name="fast-food-outline" size={44} color={COLORS.primary} />
                                </View>
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
                                <Ionicons name="close" size={20} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{name}</Text>
                            {dish.tipoPlato ? (
                                <Text style={styles.typePill}>{String(dish.tipoPlato).split("_").join(" ")}</Text>
                            ) : null}
                        </View>

                        <Text style={styles.description}>{description}</Text>

                        {ingredients.length > 0 ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Ingredientes</Text>
                                <View style={styles.chipRow}>
                                    {ingredients.map((ing, idx) => (
                                        <View key={`${ing}-${idx}`} style={styles.chip}>
                                            <Text style={styles.chipText}>{ing}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.priceCard}>
                            <View>
                                <Text style={styles.priceLabel}>Precio unitario</Text>
                                <Text style={styles.priceValue}>Q{price.toFixed(2)}</Text>
                            </View>
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    style={styles.stepButton}
                                    onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="remove" size={20} color={COLORS.text} />
                                </TouchableOpacity>
                                <Text style={styles.stepValue}>{quantity}</Text>
                                <TouchableOpacity
                                    style={styles.stepButton}
                                    onPress={() => setQuantity((current) => current + 1)}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="add" size={20} color={COLORS.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Notas especiales (opcional)</Text>
                            <TextInput
                                value={notas}
                                onChangeText={setNotas}
                                placeholder="Sin cebolla, sin picante, etc."
                                placeholderTextColor="#94a3b8"
                                style={styles.notesInput}
                                multiline
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.addButton, isAdding && styles.addButtonDone]}
                            onPress={handleAdd}
                            activeOpacity={0.9}
                            disabled={isAdding}
                        >
                            <Ionicons
                                name={isAdding ? "checkmark-circle" : "cart"}
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.addButtonText}>
                                {isAdding ? "Agregado" : `Agregar al pedido  ·  Q${total.toFixed(2)}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "flex-end",
    },
    backdropTouch: {
        flex: 1,
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 10,
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -8 },
        elevation: 16,
    },
    handle: {
        alignSelf: "center",
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#e2e8f0",
        marginBottom: 8,
    },
    scroll: {
        flexShrink: 1,
    },
    body: {
        paddingHorizontal: 20,
        paddingBottom: 18,
        gap: 16,
    },
    imageWrap: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 22,
        backgroundColor: COLORS.accentSoft,
    },
    imageFallback: {
        width: "100%",
        height: 200,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.accentSoft,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.92)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    name: {
        flex: 1,
        color: COLORS.text,
        fontSize: 24,
        fontWeight: "900",
        lineHeight: 28,
    },
    typePill: {
        color: COLORS.accent,
        backgroundColor: COLORS.accentSoft,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 9,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        overflow: "hidden",
    },
    description: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 21,
    },
    section: {
        gap: 10,
    },
    sectionLabel: {
        color: COLORS.textLight,
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    chipText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: "700",
    },
    priceCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        padding: 16,
    },
    priceLabel: {
        color: COLORS.textLight,
        fontSize: 10,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    priceValue: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: "900",
        marginTop: 4,
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: "#fff",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    stepButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.surfaceMuted,
        alignItems: "center",
        justifyContent: "center",
    },
    stepValue: {
        minWidth: 22,
        textAlign: "center",
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "900",
    },
    notesInput: {
        minHeight: 70,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surfaceMuted,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
        textAlignVertical: "top",
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 30 : 18,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: "#fff",
    },
    addButton: {
        minHeight: 56,
        borderRadius: 18,
        backgroundColor: COLORS.primaryDark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    addButtonDone: {
        backgroundColor: COLORS.success,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 0.4,
    },
});

export default DishDetailModal;
