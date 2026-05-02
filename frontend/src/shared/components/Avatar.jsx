import { useEffect, useMemo, useState } from "react";

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

const buildDefaultAvatar = (name) => {
    const initials = getInitials(name || "Usuario");
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fb923c"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                </linearGradient>
            </defs>
            <rect width="160" height="160" rx="80" fill="url(#g)"/>
            <circle cx="118" cy="35" r="34" fill="#ffffff" opacity="0.18"/>
            <circle cx="38" cy="130" r="42" fill="#ffffff" opacity="0.14"/>
            <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
                font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="#ffffff">
                ${initials}
            </text>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const Avatar = ({ src, name = "", size = 36, className = "" }) => {
    const avatarSrc = resolveAvatarSrc(src);
    const defaultAvatarSrc = useMemo(() => buildDefaultAvatar(name), [name]);
    const [currentSrc, setCurrentSrc] = useState(avatarSrc || defaultAvatarSrc);

    useEffect(() => {
        setCurrentSrc(avatarSrc || defaultAvatarSrc);
    }, [avatarSrc, defaultAvatarSrc]);

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700 ${className}`}
            style={{ width: size, height: size }}
        >
            <img
                src={currentSrc}
                alt={name || "Usuario"}
                className="h-full w-full rounded-full object-cover"
                onError={() => setCurrentSrc(defaultAvatarSrc)}
            />
        </div>
    );
};
