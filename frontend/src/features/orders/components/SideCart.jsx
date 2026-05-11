
import { useCartStore } from "../store/useCartStore";
import { Link } from "react-router-dom";

export const SideCart = ({ isOpen, onClose }) => {
    const { items, addItem, removeItem, clearItem, getSubtotal, getTotalItems } = useCartStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md transform transition duration-500 ease-in-out sm:duration-700">
                    <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[2.5rem]">
                        <div className="flex items-center justify-between px-8 py-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Tu Carrito</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {getTotalItems()} platos seleccionados
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-2xl bg-slate-50 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 no-scrollbar">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-6 rounded-full bg-orange-50 p-10 text-6xl">🛒</div>
                                    <h3 className="text-xl font-bold text-slate-900">Tu carrito está vacío</h3>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Parece que aún no has agregado nada. <br /> ¡Explora nuestros restaurantes!
                                    </p>
                                    <button 
                                        onClick={onClose}
                                        className="mt-8 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
                                    >
                                        Empezar a comprar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="group flex items-center gap-4 rounded-3xl border border-slate-50 p-3 transition-all hover:border-orange-100 hover:bg-orange-50/30">
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-2xl">🍲</div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                                                    <button onClick={() => clearItem(item.id)} className="text-slate-300 hover:text-rose-500 transition">
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="mt-1 text-xs font-black text-orange-500">Q{item.price.toFixed(2)}</p>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 p-1 shadow-sm">
                                                        <button 
                                                            onClick={() => removeItem(item.id)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => addItem(item, item.restaurantId)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900">
                                                        Q{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="border-t border-slate-100 bg-slate-50/50 px-8 py-10 rounded-tl-[2.5rem]">
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                        <span className="font-black text-slate-900">Q{getSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Envío</span>
                                        <span className="font-black text-green-500">GRATIS</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                                        <span className="text-lg font-black text-slate-900">Total</span>
                                        <span className="text-2xl font-black text-orange-500">Q{getSubtotal().toFixed(2)}</span>
                                    </div>
                                </div>
                                <Link
                                    to="/home/checkout"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-5 text-sm font-black text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95"
                                >
                                    Proceder al Pago
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                                <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Garantía de sabor y entrega rápida
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
