import { useCartStore } from "../store/useCartStore";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export const SideCart = ({ isOpen, onClose }) => {
    const { items, addItem, removeItem, clearItem, getSubtotal, getTotalItems } = useCartStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Immersive Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500" 
                onClick={onClose}
            />
            
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                <div className="w-screen max-w-md transform animate-in slide-in-from-right duration-500 ease-out">
                    <div className="flex h-full flex-col bg-white shadow-[0_0_100px_rgba(0,0,0,0.2)] sm:rounded-l-[3.5rem] overflow-hidden border-l border-slate-100">
                        {/* Header Section */}
                        <div className="relative px-8 py-10 border-b border-slate-100 bg-white z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mi Selección</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {getTotalItems()} Platillos en espera
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="group rounded-full bg-slate-50 p-3 text-slate-400 border border-slate-100 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-90"
                                >
                                    <X className="h-6 w-6" strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar bg-slate-50/50 z-10">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute -inset-8 bg-orange-100 rounded-full blur-2xl opacity-50" />
                                        <div className="relative h-32 w-32 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-xl">
                                            <ShoppingBag className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Tu carrito está esperando...</h3>
                                        <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed max-w-[250px] mx-auto">
                                            Parece que aún no has elegido tu próximo festín. ¡Nuestros chefs están listos!
                                        </p>
                                    </div>
                                    <button 
                                        onClick={onClose}
                                        className="rounded-full bg-orange-500 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95"
                                    >
                                        Explorar Menús
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="group relative flex gap-5 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.5rem] bg-slate-50 border border-slate-100">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-3xl bg-slate-100">🥘</div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between py-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 leading-tight line-clamp-2">{item.name}</h4>
                                                        <p className="mt-1 text-sm font-bold text-orange-500">Q{item.price.toFixed(2)}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => clearItem(item.id)} 
                                                        className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-75"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-4">
                                                    <div className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 p-1">
                                                        <button 
                                                            onClick={() => removeItem(item.id)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-500 hover:text-orange-500 shadow-sm transition-all active:scale-90"
                                                        >
                                                            <Minus size={14} strokeWidth={2.5} />
                                                        </button>
                                                        <span className="text-xs font-bold w-8 text-center text-slate-900">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => addItem(item, item.restaurantId)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-orange-500 shadow-sm transition-all active:scale-90"
                                                        >
                                                            <Plus size={14} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                    <span className="text-base font-black text-slate-900 tracking-tight">
                                                        Q{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Section */}
                        {items.length > 0 && (
                            <div className="relative px-8 py-10 bg-slate-950 sm:rounded-tl-[3.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-slate-200 z-20">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-12 rounded-full bg-slate-800" />
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Subtotal Bruto</span>
                                        <span className="text-sm font-bold text-white">Q{getSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <div className="flex items-center gap-2">
                                            <Truck size={14} className="text-emerald-400" />
                                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Envío Premium</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">Gratis</span>
                                    </div>
                                    <div className="h-px w-full bg-white/10 my-6" />
                                    <div className="flex justify-between items-end px-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                                            <span className="text-4xl font-black text-white tracking-tighter">Q{getSubtotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to="/home/checkout"
                                    onClick={onClose}
                                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-[1.5rem] bg-orange-500 p-2 transition-all duration-300 hover:bg-orange-600 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-orange-500 transition-transform duration-300 group-hover:scale-105">
                                            <ArrowRight className="h-5 w-5" strokeWidth={3} />
                                        </div>
                                        <span className="text-xs font-bold text-white uppercase tracking-widest ml-1">Confirmar Pedido</span>
                                    </div>
                                    <div className="pr-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                        <ShoppingBag size={18} className="text-white" />
                                    </div>
                                </Link>
                                
                                <p className="mt-6 text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                    KinalEats • Premium Delivery
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
