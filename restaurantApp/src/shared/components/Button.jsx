import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native"
import { COLORS, SPACING, FONT_SIZE } from "../constants/theme"

const Button = ({
    title,
    onPress,
    loading,
    variant = "primary",
    style,
    ...props
}) => {
    const isSecondary = variant === "secondary";

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
                loading && styles.buttonDisabled,
                style
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={isSecondary ? COLORS.primary : COLORS.surface}
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isSecondary ? styles.textSecondary : styles.textPrimary,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
    },
    buttonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
    },
    textPrimary: {
        color: COLORS.surface,
    },
    textSecondary: {
        color: COLORS.primary,
    },
});

export default Button;