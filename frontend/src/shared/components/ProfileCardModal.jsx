import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import styled from "styled-components";
import { Avatar } from "./Avatar";
import { useAuthStore } from "../../features/auth/store/authStore";
import { showError, showSuccess } from "../utils/toast";

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.58);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1000;
    animation: fadeIn 0.2s ease-in;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

const StyledCardWrapper = styled.div`
    width: min(100%, 430px);

    .card {
        --main-color: #1e293b;
        --submain-color: #64748b;
        --accent-color: #ea580c;
        --bg-color: #fff;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        position: relative;
        width: 100%;
        max-height: calc(100vh - 48px);
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 18px;
        background: var(--bg-color);
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
        border: 1px solid rgba(226, 232, 240, 0.9);
        overflow: auto;
        animation: slideUp 0.3s ease-out;

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    }

    .card__img {
        height: 128px;
        width: 100%;
        position: relative;
        overflow: hidden;
        flex: 0 0 auto;
        background:
            linear-gradient(135deg, rgba(234, 88, 12, 0.92) 0%, rgba(249, 115, 22, 0.9) 46%, rgba(14, 165, 233, 0.75) 100%),
            #f97316;

        &::before {
            content: "";
            position: absolute;
            inset: 0;
            background: 
                radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent),
                radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.1), transparent);
        }
    }

    .card__avatar {
        position: absolute;
        width: 112px;
        height: 112px;
        background: var(--bg-color);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        top: 72px;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
        border: 4px solid var(--bg-color);
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }
    }

    .card__title {
        width: 100%;
        margin: 70px 0 0;
        padding: 0 28px;
        font-weight: 700;
        font-size: 22px;
        line-height: 1.2;
        text-align: center;
        color: var(--main-color);
        overflow-wrap: anywhere;
    }

    .card__subtitle {
        margin: 7px 0 0;
        padding: 0 28px;
        font-weight: 500;
        font-size: 14px;
        text-align: center;
        color: var(--submain-color);
        overflow-wrap: anywhere;
    }

    .card__info {
        width: 100%;
        padding: 0 24px;
        margin-top: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .card__info-item {
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
        padding: 12px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font-size: 13px;

        span:first-child {
            color: var(--submain-color);
            font-weight: 500;
        }

        span:last-child {
            color: var(--main-color);
            font-weight: 600;
            min-width: 0;
            text-align: right;
            overflow-wrap: anywhere;
        }
    }

    .card__wrapper {
        width: 100%;
        padding: 22px 24px 24px;
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    .card__btn {
        flex: 1;
        padding: 10px 16px;
        border: 2px solid var(--main-color);
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        color: var(--main-color);
        background: var(--bg-color);
        text-transform: uppercase;
        transition: all 0.3s ease;
        cursor: pointer;
        letter-spacing: 0.5px;

        &:hover {
            background: var(--main-color);
            color: var(--bg-color);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .card__btn-solid {
        background: linear-gradient(135deg, var(--accent-color) 0%, #f97316 100%);
        color: var(--bg-color);
        border-color: transparent;

        &:hover {
            background: linear-gradient(135deg, #dc5a0f 0%, #ea580c 100%);
            color: var(--bg-color);
        }
    }

    .card__form {
        width: 100%;
        padding: 74px 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .card__form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .card__form-label {
        font-weight: 600;
        font-size: 12px;
        color: var(--main-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .card__form-input {
        padding: 10px 12px;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
        transition: all 0.2s ease;
        background: #f8fafc;

        &:focus {
            outline: none;
            border-color: var(--accent-color);
            background: white;
            box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
        }

        &.error {
            border-color: #ef4444;
            background: #fee2e2;
        }
    }

    .card__form-error {
        font-size: 11px;
        color: #ef4444;
        font-weight: 500;
    }

    .card__form-success {
        font-size: 11px;
        color: #22c55e;
        font-weight: 500;
    }

    .card__divider {
        height: 1px;
        background: #e2e8f0;
        margin: 0;
    }

    @media (max-width: 480px) {
        .card__info-item {
            grid-template-columns: 1fr;
            gap: 4px;
        }

        .card__info-item span:last-child {
            text-align: left;
        }

        .card__wrapper {
            flex-direction: column;
        }
    }
`;

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

export const ProfileCardModal = ({ isOpen, onClose }) => {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        if (!user || !isOpen) return;
        reset({
            name: user.name || "",
            surname: user.surname || "",
            phone: user.phone || "",
        });
    }, [reset, user, isOpen]);

    if (!isOpen || !user) return null;

    const submit = async (values) => {
        try {
            setIsSaving(true);
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
        } catch (error) {
            showError("Error al actualizar");
        } finally {
            setIsSaving(false);
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

    const closeModal = () => {
        setIsEditing(false);
        onClose();
    };

    return createPortal(
        <Backdrop onClick={closeModal}>
            <StyledCardWrapper
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Perfil de usuario"
            >
                <div className="card">
                    {/* Header Image */}
                    <div className="card__img"></div>

                    {/* Avatar */}
                    <div className="card__avatar">
                        <Avatar
                            src={previewUrl || user.profilePicture}
                            name={getFullName(user)}
                            size={104}
                        />
                    </div>

                    {/* Content */}
                    {!isEditing ? (
                        <>
                            <p className="card__title">{getFullName(user)}</p>
                            <p className="card__subtitle">@{user.username}</p>

                            <div className="card__info">
                                <div className="card__info-item">
                                    <span>Teléfono:</span>
                                    <span>{user.phone || "No registrado"}</span>
                                </div>
                                <div className="card__info-item">
                                    <span>Rol:</span>
                                    <span>{user.role || "Usuario"}</span>
                                </div>
                                <div className="card__info-item">
                                    <span>Correo:</span>
                                    <span className="text-xs">{user.email}</span>
                                </div>
                            </div>

                            <div className="card__wrapper">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="card__btn card__btn-solid"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="card__btn"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit(submit)} className="card__form">
                            <div className="card__form-group">
                                <label className="card__form-label">Nombre</label>
                                <input
                                    {...register("name", {
                                        required: "El nombre es obligatorio",
                                        minLength: {
                                            value: 2,
                                            message: "Mínimo 2 caracteres",
                                        },
                                    })}
                                    className={`card__form-input ${errors.name ? "error" : ""}`}
                                    placeholder="Tu nombre"
                                />
                                {errors.name && (
                                    <span className="card__form-error">{errors.name.message}</span>
                                )}
                            </div>

                            <div className="card__form-group">
                                <label className="card__form-label">Apellido</label>
                                <input
                                    {...register("surname", {
                                        required: "El apellido es obligatorio",
                                        minLength: {
                                            value: 2,
                                            message: "Mínimo 2 caracteres",
                                        },
                                    })}
                                    className={`card__form-input ${errors.surname ? "error" : ""}`}
                                    placeholder="Tu apellido"
                                />
                                {errors.surname && (
                                    <span className="card__form-error">{errors.surname.message}</span>
                                )}
                            </div>

                            <div className="card__form-group">
                                <label className="card__form-label">Teléfono</label>
                                <input
                                    {...register("phone", {
                                        required: "El teléfono es obligatorio",
                                        pattern: {
                                            value: /^\d{8}$/,
                                            message: "8 dígitos requeridos",
                                        },
                                    })}
                                    type="tel"
                                    maxLength="8"
                                    className={`card__form-input ${errors.phone ? "error" : ""}`}
                                    placeholder="12345678"
                                />
                                {errors.phone && (
                                    <span className="card__form-error">{errors.phone.message}</span>
                                )}
                            </div>

                            <div className="card__form-group">
                                <label className="card__form-label">Foto de Perfil</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("profilePicture")}
                                    className="card__form-input"
                                />
                                <span className="text-xs text-slate-500">Max 5MB</span>
                            </div>

                            <div className="card__divider"></div>

                            <div className="card__wrapper">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="card__btn"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || loading}
                                    className="card__btn card__btn-solid"
                                >
                                    {isSaving ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </StyledCardWrapper>
        </Backdrop>,
        document.body
    );
};
