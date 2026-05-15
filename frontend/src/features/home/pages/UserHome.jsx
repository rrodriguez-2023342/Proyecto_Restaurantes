import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ChevronRight, Play, Award, ShieldCheck, Zap, X, Heart, Globe, Flame, Leaf, Coffee, ArrowRight, Utensils, MousePointer2, Check, Diamond, Crown } from "lucide-react";

import res1 from "../../../assets/images/Restaurante1.webp";
import res2 from "../../../assets/images/Restaurante2.jpg";
import res3 from "../../../assets/images/Restaurante3.jpg";
import res4 from "../../../assets/images/Restaurante4.jpg";
import res5 from "../../../assets/images/Restaurante5.jpg";

// ── Components ─────────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
    <div className="group relative bg-white p-12 transition-all duration-500 border-l border-slate-100 hover:bg-slate-50 overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 pointer-events-none">
            {icon}
        </div>
        <div className="relative z-10">
            <div className="mb-6 text-3xl text-amber-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="mb-4 text-lg font-black text-slate-900 tracking-[0.2em] uppercase group-hover:text-amber-600 transition-colors duration-500">
                {title}
            </h3>
            <p className="text-[13px] leading-relaxed text-slate-500 font-light italic opacity-80 group-hover:opacity-100 transition-opacity">
                {desc}
            </p>
            <div className="mt-8 h-0.5 w-8 bg-slate-100 group-hover:w-full group-hover:bg-amber-500 transition-all duration-700" />
        </div>
    </div>
);

const StatCard = ({ value, label }) => (
    <div className="flex flex-col items-center group px-8">
        <p className="text-4xl md:text-5xl font-extralight text-slate-950 tracking-tighter mb-1.5 group-hover:text-amber-600 transition-colors duration-500">{value}</p>
        <div className="h-0.5 w-10 bg-amber-500 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 group-hover:text-slate-500 transition-colors">{label}</p>
    </div>
);

const WhyItem = ({ icon, title, desc }) => (
    <div className="flex gap-6 items-start group">
        <div className="flex-shrink-0 h-12 w-12 rounded-full border border-slate-100 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
            {icon}
        </div>
        <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">{title}</h4>
            <p className="text-xs leading-relaxed text-slate-400 font-light italic">{desc}</p>
        </div>
    </div>
);

export const UserHome = () => {
    const featuredImages = [res1, res2, res3, res4, res5, res1, res2];

    return (
        <div className="w-full space-y-0 bg-white selection:bg-amber-100">
            
            {/* ── HERO: THE GOLDEN MEAN ── */}
            <section className="group/hero relative w-full overflow-hidden bg-white min-h-[500px] md:min-h-[700px] flex items-center border-b border-slate-50">
                <div className="absolute top-0 right-0 w-full md:w-3/5 h-full overflow-hidden">
                    <img 
                        src={res3} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale contrast-110 transition-all duration-[2s] group-hover/hero:grayscale-0 group-hover/hero:scale-105 group-hover/hero:opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                </div>
                
                <div className="relative z-10 w-full px-6 md:px-16 lg:px-32 py-20 md:py-0">
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom duration-1000">
                        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                            <div className="h-px w-12 md:w-20 bg-amber-500" />
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-amber-600">Edición 2026</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-8xl font-extralight text-slate-950 tracking-tighter leading-[1] md:leading-[0.9] mb-8 md:mb-10 italic">
                            Redefiniendo el<br />
                            <span className="font-black text-amber-500 not-italic">Lujo Culinario.</span>
                        </h1>
                        
                        <p className="text-base md:text-xl text-slate-400 font-light max-w-xl leading-relaxed mb-10 md:mb-14 italic">
                            Una curaduría de experiencias diseñadas para quienes entienden que comer es un arte, no una necesidad. 
                            <span className="text-slate-900 font-medium block mt-4">Bienvenidos al Club de KinalEats.</span>
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-8 md:gap-12 items-center sm:items-start">
                            <Link
                                to="/home/restaurants"
                                className="group/link relative text-slate-950 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] transition-all"
                            >
                                <span className="relative">
                                    Explorar Restaurantes
                                    <span className="absolute -bottom-3 left-0 w-full h-0.5 bg-amber-500 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500 origin-left" />
                                </span>
                            </Link>
                            
                            <Link
                                to="/reservaciones"
                                className="bg-slate-950 text-white px-10 md:px-14 py-4 md:py-6 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-amber-600 transition-all shadow-2xl active:scale-95 text-center w-full sm:w-auto"
                            >
                                Reservar Mesa
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-white py-16 md:py-24 border-b border-slate-50">
                <div className="max-w-[1500px] mx-auto grid grid-cols-2 lg:flex lg:justify-center gap-y-12 gap-x-8 md:gap-24 lg:gap-32">
                    <StatCard value="60+" label="Partners" />
                    <StatCard value="15K" label="Servicios" />
                    <StatCard value="24H" label="Concierge" />
                    <StatCard value="4.9" label="Excelencia" />
                </div>
            </section>

            {/* ── TRENDS CAROUSEL ── */}
            <section className="w-full py-32 overflow-hidden">
                <div className="text-center space-y-6 mb-24">
                    <span className="text-[11px] font-black uppercase tracking-[0.7em] text-amber-600">Curaduría</span>
                    <h2 className="text-5xl md:text-6xl font-extralight text-slate-950 tracking-tighter italic">Tendencias</h2>
                    <div className="h-1 w-16 bg-amber-500 mx-auto mt-10" />
                </div>
                <div className="relative flex">
                    <div className="flex animate-marquee gap-10 whitespace-nowrap">
                        {[...featuredImages, ...featuredImages, ...featuredImages].map((img, i) => (
                            <div key={i} className="group relative w-[280px] md:w-[400px] aspect-[3/4] overflow-hidden bg-slate-50 transition-all duration-1000 hover:shadow-2xl">
                                <img src={img} alt="" className="h-full w-full object-cover grayscale transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
                    .animate-marquee { animation: marquee 50s linear infinite; }
                    .animate-marquee:hover { animation-play-state: paused; }
                `}} />
            </section>

            {/* ── FEATURES ── */}
            <section className="w-full py-0 border-y border-slate-100">
                <div className="max-w-full mx-auto grid md:grid-cols-3 divide-x divide-slate-100">
                    <FeatureCard icon={<MousePointer2 strokeWidth={1} size={32} />} title="Reserva" desc="Protocolo de acceso prioritario diseñado para las mesas más codiciadas de la ciudad." />
                    <FeatureCard icon={<Award strokeWidth={1} size={32} />} title="Curaduría" desc="Cada establecimiento es auditado bajo los más estrictos estándares internacionales." />
                    <FeatureCard icon={<Globe strokeWidth={1} size={32} />} title="Logística" desc="Sistema de transporte de guante blanco para preservar cada matiz culinario." />
                </div>
            </section>

            {/* ── WHY KINALEATS? (NEW SECTION) ── */}
            <section className="w-full py-32 px-6 md:px-16 lg:px-32 bg-[#fafafa]">
                <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <span className="text-[11px] font-black uppercase tracking-[0.7em] text-amber-600">El Diferencial</span>
                            <h2 className="text-5xl md:text-6xl font-extralight text-slate-950 tracking-tighter italic leading-tight">¿Por qué elegir<br /><span className="font-black text-amber-500 not-italic">KinalEats?</span></h2>
                        </div>
                        <p className="text-base text-slate-400 font-light italic leading-relaxed max-w-lg">
                            No somos una aplicación de entregas. Somos tu acceso directo a la alta gastronomía, garantizando que el esfuerzo del chef llegue intacto a tu paladar.
                        </p>
                        <div className="grid gap-8">
                            <WhyItem icon={<Diamond size={20} />} title="Calidad Intacta" desc="Embalaje térmico de grado médico para preservar texturas y temperaturas." />
                            <WhyItem icon={<Crown size={20} />} title="Acceso VIP" desc="Mesas garantizadas incluso en los días de mayor demanda." />
                            <WhyItem icon={<ShieldCheck size={20} />} title="Seguridad Élite" desc="Protocolos de manejo de alimentos certificados por estándares globales." />
                        </div>
                    </div>
                    <div className="relative aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-[3rem] shadow-2xl border-[16px] border-white">
                        <img src={res2} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/20" />
                        <div className="absolute bottom-12 left-12 bg-white p-8 rounded-3xl shadow-2xl">
                            <p className="text-3xl font-black text-slate-900 italic mb-1">99.8%</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Satisfacción Élite</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA: REFINED & COMPACT ── */}
            <section className="w-full py-32 px-6 relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_1px,transparent_1px)] [background-size:40px_40px]" />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center justify-center gap-4 text-amber-500">
                        <div className="h-px w-8 bg-amber-500/30" />
                        <Diamond size={16} />
                        <div className="h-px w-8 bg-amber-500/30" />
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-extralight text-white tracking-tighter italic leading-none">
                        La distinción está<br />
                        <span className="font-black text-amber-500 not-italic uppercase tracking-[0.1em] text-4xl md:text-6xl">a un click.</span>
                    </h2>
                    
                    <p className="text-sm md:text-base text-slate-400 font-light tracking-[0.4em] uppercase opacity-60">
                        Únete a la Élite Gastronómica de Guatemala
                    </p>
                    
                    <div className="pt-6">
                        <Link
                            to="/home/restaurants"
                            className="inline-flex items-center gap-6 bg-amber-500 text-slate-950 px-16 py-7 rounded-full text-[12px] font-black uppercase tracking-[0.5em] hover:bg-white transition-all active:scale-95 shadow-2xl shadow-amber-500/20"
                        >
                            Comenzar Ahora
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
