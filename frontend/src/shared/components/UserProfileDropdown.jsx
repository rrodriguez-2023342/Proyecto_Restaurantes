import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore } from "../../features/auth/store/authStore";
import { showError, showSuccess } from "../utils/toast";
import { Avatar } from "./Avatar.jsx";
import { FormField } from "./FormField.jsx";
import { ProfileCardModal } from "./ProfileCardModal.jsx";

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

const InfoItem = ({ label, value }) => (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-medium text-slate-700">{value || "No registrado"}</p>
    </div>
);

export const UserProfileDropdown = ({ compact = false, align = "right", placement = "down" }) => {
    const wrapperRef = useRef(null);
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm();

    const profilePicture = useWatch({ control, name: "profilePicture" });
    const previewUrl = useMemo(() => {
        if (!profilePicture?.length) return null;
        return URL.createObjectURL(profilePicture[0]);
    }, [profilePicture]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        if (!user) return;
        reset({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
        });
    }, [reset, user]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, []);

    if (!user) return null;

    const submit = async (values) => {
        const payload = new FormData();
        payload.append("name", values.name);
        payload.append("surname", values.surname);
        payload.append("phone", values.phone);

        if (values.profilePicture?.[0]) {
            payload.append("profilePicture", values.profilePicture[0]);
        }

        const result = await updateProfile(payload);
        if (result.success) {
            showSuccess("Perfil actualizado");
            setIsEditing(false);
        } else {
            showError(result.error || "No se pudo actualizar el perfil");
        }
    };

    const cancelEdit = () => {
        reset({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
            profilePicture: null,
        });
        setIsEditing(false);
    };

    const panelPosition = align === "left" ? "left-0" : "right-0";
    const panelPlacement = placement === "up" ? "bottom-full mb-3" : "top-full mt-3";

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                className={`flex items-center gap-3 rounded-full transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                    compact ? "p-1" : "px-2 py-1"
                }`}
                aria-label="Abrir perfil de usuario"
                aria-expanded={isCardModalOpen}
            >
                <Avatar
                    src={user.profilePicture}
                    name={getFullName(user)}
                    size={compact ? 36 : 40}
                />
                {!compact && (
                    <span className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                            {getFullName(user)}
                        </span>
                        <span className="block truncate text-xs text-slate-500">{user.role || "USER_ROLE"}</span>
                    </span>
                )}
            </button>

            {/* Profile Card Modal */}
            <ProfileCardModal
                isOpen={isCardModalOpen}
                onClose={() => setIsCardModalOpen(false)}
            />
        </div>
    );
};
