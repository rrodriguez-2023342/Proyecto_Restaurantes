const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase()).join("");
};

const resolveAvatarSrc = (src) => {
    if (!src) return null;
    if (
        src.startsWith("http") ||
        src.startsWith("data:") ||
        src.startsWith("blob:")
    ) {
        return src;
    }
    const base = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    if (base) return `${base}${src}`;
    return null;
};

export const Avatar = ({ src, name = "", size = 36, className = "" }) => {
    const avatarSrc = resolveAvatarSrc(src);
    const initials = getInitials(name || "Usuario");

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 ${className}`}
            style={{ width: size, height: size }}
        >
            {avatarSrc ? (
                <img
                    src={avatarSrc}
                    alt={name}
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
};
