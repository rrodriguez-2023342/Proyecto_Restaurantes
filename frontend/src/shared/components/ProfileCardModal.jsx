import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { X, User, Phone, Mail, Shield, Camera, Save, ArrowLeft, Diamond, Crown, Upload, MapPin, Globe } from "lucide-react";
import { Avatar } from "./Avatar";
import { useAuthStore } from "../../features/auth/store/authStore";
import { showError, showSuccess } from "../utils/toast";

const getFullName = (user) =>
    [user?.name, user?.surname].filter(Boolean).join(" ") || user?.username || "Usuario";

const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-8 py-6 border-b border-slate-50 last:border-0 group transition-all duration-500 hover:pl-2">
        <div className="flex-shrink-0 w-5 text-slate-300 group-hover:text-amber-500 transition-colors duration-500">
            <Icon size={16} strokeWidth={1.2} />
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400/80 leading-none">
                {label}
            </span>
            <span className="text-[13px] font-medium text-slate-800 tracking-tight leading-none">
                {value}
            </span>
        </div>
    </div>
);

export const ProfileCardModal = ({ isOpen, onClose }) => {
    const user = useAuthStore((state) => state.user);
    const loading = useAuthStore((state) => state.loading);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm();

    const profilePicture = useWatch({ control, name: "profilePicture" });

    const previewUrl = useMemo(() => {
        if (!profilePicture || !profilePicture[0]) return null;
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValue("profilePicture", e.target.files);
        }
    };

    const submit = async (values) => {
        try {
            setIsSaving(true);
            const payload = new FormData();
            payload.append("name", values.name);
            payload.append("surname", values.surname);
            payload.append("phone", values.phone);

            if (values.profilePicture && values.profilePicture[0]) {
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
        });
        setIsEditing(false);
    };

    const closeModal = () => {
        setIsEditing(false);
        onClose();
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={closeModal}
        >
            <div 
                className="relative w-full max-w-[420px] bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── HIGH-END HEADER ── */}
                <div className="h-40 w-full bg-slate-950 relative overflow-hidden">
                    {/* Animated Mesh Gradient Background */}
                    <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[140%] bg-[radial-gradient(circle_at_center,#f59e0b_0%,transparent_50%)] blur-[80px] animate-pulse" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[120%] bg-[radial-gradient(circle_at_center,#451a03_0%,transparent_60%)] blur-[60px]" />
                    </div>
                    
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    
                    <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40">KinalEats Premium</span>
                    </div>
                </div>

                {/* ── AVATAR SECTION ── */}
                <div className="absolute top-24 left-10">
                    <div className="relative group/avatar">
                        <div className="p-1 bg-white rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">
                            <Avatar
                                src={previewUrl || user.profilePicture}
                                name={getFullName(user)}
                                size={110}
                                className="rounded-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700 ring-2 ring-slate-100"
                            />
                        </div>
                        {isEditing && (
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 h-11 w-11 bg-slate-950 text-white rounded-full border-4 border-white flex items-center justify-center cursor-pointer shadow-2xl hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 active:scale-90 z-20"
                            >
                                <Camera size={18} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Hidden File Input Master */}
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {/* ── CONTENT ── */}
                <div className="pt-24 pb-12 px-12">
                    {!isEditing ? (
                        <div className="space-y-10 animate-in fade-in duration-1000">
                            {/* Identity Section */}
                            <div className="space-y-1">
                                <h2 className="text-3xl font-light text-slate-950 tracking-tighter leading-none lowercase">
                                    {user.name} <span className="font-black italic text-amber-500">{user.surname}</span>
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                                    @{user.username}
                                </p>
                            </div>

                            {/* Info List Section */}
                            <div className="space-y-0">
                                <InfoItem icon={Phone} label="Contact Line" value={user.phone || "Private"} />
                                <InfoItem icon={Shield} label="Account Status" value={user.role === 'ADMIN_ROLE' ? 'Elite Executive' : 'Private Member'} />
                                <InfoItem icon={Mail} label="Digital Mail" value={user.email} />
                            </div>

                            {/* Luxury Buttons */}
                            <div className="flex items-center justify-between pt-6">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 hover:text-amber-500 transition-colors duration-500 flex items-center gap-3 group"
                                >
                                    <span className="w-8 h-[1px] bg-slate-200 group-hover:w-12 group-hover:bg-amber-500 transition-all duration-500" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="h-14 px-8 bg-slate-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-slate-950 transition-all duration-500 shadow-xl shadow-slate-950/20 active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(submit)} className="space-y-8 animate-in fade-in duration-500">
                            <div className="space-y-5">
                                {/* Photo Status */}
                                <div className="mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={12} strokeWidth={3} />
                                        {profilePicture ? 'New Media Selected' : 'Replace Image'}
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 ml-1">Name</label>
                                    <input
                                        {...register("name", { required: "Required" })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-200"
                                        placeholder="Given name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 ml-1">Surname</label>
                                    <input
                                        {...register("surname", { required: "Required" })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-200"
                                        placeholder="Family name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 ml-1">Direct Line</label>
                                    <input
                                        {...register("phone", { 
                                            required: "Required",
                                            pattern: { value: /^\d{8}$/, message: "8 digits" }
                                        })}
                                        className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-200"
                                        placeholder="8 digit phone"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="flex-1 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors py-5"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-amber-500 text-slate-950 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                                >
                                    {isSaving ? "Updating..." : "Commit Changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
