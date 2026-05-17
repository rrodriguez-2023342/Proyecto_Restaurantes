
import { useCartStore } from "../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createOrder } from "../../../shared/api";
import { showError } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Phone, CreditCard, ShieldCheck, Check } from "lucide-react";

export const CheckoutPage = () => {
    const { items, getSubtotal, clearCart, restaurantId } = useCartStore();
    const user = useAuthStore(state => state.user);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const subtotal = getSubtotal();
    const shipping = 0;
    const total = subtotal + shipping;

    const onSubmit = async (data) => {
        try {
            // Group items by restaurantId
            const itemsByRestaurant = {};
            items.forEach(item => {
                const rId = item.restaurantId || restaurantId;
                if (!itemsByRestaurant[rId]) {
                    itemsByRestaurant[rId] = [];
                }
                itemsByRestaurant[rId].push(item);
            });

            const restaurantIds = Object.keys(itemsByRestaurant);

            // Create an order for each restaurant
            const orderPromises = restaurantIds.map(async (rId) => {
                const orderItems = itemsByRestaurant[rId].map(item => ({
                    plato: item.id,
                    cantidad: item.quantity,
                    precio: item.price
                }));

                const payload = {
                    restaurante: rId,
                    items: orderItems,
                    direccionEntrega: data.address,
                    notas: data.notes,
                    metodoPago: data.paymentMethod,
                    tipoPedido: 'Domicilio', // Por defecto para esta vista
                    cliente: `${user?.name || ''} ${user?.surname || ''}`.trim() || 'Cliente Web',
                    email: user?.email,
                    telefono: data.phone || ''
                };

                return createOrder(payload);
            });

            await Promise.all(orderPromises);
            
            toast.success("¡Pedido(s) realizado(s) con éxito!", {
                icon: '🎉',
                duration: 5000,
                style: { borderRadius: '20px', background: '#333', color: '#fff' }
            });
            
            clearCart();
            navigate("/home/invoices"); 
        } catch (err) {
            console.error("Error en checkout:", err);
            const errorMsg = err.response?.data?.message || err.message;
            const validationErrors = err.response?.data?.errors;
            
            if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
                const detailedMsg = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
                showError(`Error de validación: ${detailedMsg}`);
            } else if (errorMsg === 'Error de validación') {
                showError("Error de validación: El servidor rechazó los datos. Verifica que todos los campos estén llenos.");
            } else {
                showError(`No se pudo procesar el pedido: ${errorMsg || "Error desconocido"}`);
            }
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-slate-50 p-12 text-7xl">🥯</div>
                <h2 className="text-3xl font-black text-slate-900">Tu carrito está vacío</h2>
                <p className="mt-4 text-slate-500">Agrega algunos platos deliciosos antes de pagar.</p>
                <Link to="/home" className="mt-10 rounded-2xl bg-orange-500 px-8 py-4 text-sm font-black text-white shadow-xl shadow-orange-200 transition hover:bg-orange-600">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    if (!restaurantId) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-orange-50 p-12 text-7xl">⚠️</div>
                <h2 className="text-3xl font-black text-slate-900">Información faltante</h2>
                <p className="mt-4 text-slate-500 max-w-md">Parece que hay un problema con la sesión de tu carrito. Por favor, limpia el carrito e intenta agregar los platos de nuevo.</p>
                <button 
                    onClick={() => { clearCart(); navigate("/home"); }}
                    className="mt-10 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl transition hover:bg-slate-800"
                >
                    Limpiar Carrito y Volver
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl pb-20 px-4 xl:px-0">
            {/* Botón de Regresar */}
            <button 
                onClick={() => navigate(-1)} 
                className="group mb-12 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 transition-colors group-hover:bg-slate-100">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                </div>
                Volver
            </button>

            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Finalizar <span className="text-orange-500">Pedido</span>
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-500">
                    Completa tus datos para disfrutar de la experiencia KinalEats.
                </p>
            </div>
            
            <div className="grid gap-12 lg:grid-cols-12">
                {/* Formulario */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Dirección */}
                        <section className="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                                    <MapPin className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Dirección de Entrega</h3>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">¿A dónde enviamos tu orden?</p>
                                </div>
                            </div>
                            <textarea
                                {...register("address", { required: "La dirección es obligatoria" })}
                                placeholder="Escribe tu dirección completa aquí..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm text-slate-700 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all min-h-[120px] resize-none"
                            />
                            {errors.address && <p className="mt-3 text-[11px] font-bold text-rose-500 uppercase tracking-wider">{errors.address.message}</p>}
                        </section>

                        {/* Teléfono */}
                        <section className="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                    <Phone className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Teléfono de Contacto</h3>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">Para comunicarnos contigo</p>
                                </div>
                            </div>
                            <input
                                type="tel"
                                {...register("phone", { required: "El teléfono es necesario" })}
                                placeholder="Ej: 5555-5555"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm text-slate-700 placeholder-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                            />
                            {errors.phone && <p className="mt-3 text-[11px] font-bold text-rose-500 uppercase tracking-wider">{errors.phone.message}</p>}
                        </section>

                        {/* Método de Pago */}
                        <section className="rounded-[2rem] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
                                    <CreditCard className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Método de Pago</h3>
                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">Elige cómo deseas pagar</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {['Efectivo', 'Tarjeta'].map((method) => (
                                    <label key={method} className="group relative flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50/80">
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 group-has-[:checked]:border-slate-900 transition-colors">
                                                <input
                                                    type="radio"
                                                    value={method}
                                                    {...register("paymentMethod", { required: "Selecciona uno" })}
                                                    className="peer sr-only"
                                                />
                                                <div className="h-2.5 w-2.5 scale-0 rounded-full bg-slate-900 transition-transform peer-checked:scale-100" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 group-has-[:checked]:text-slate-900 transition-colors">{method}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.paymentMethod && <p className="mt-3 text-[11px] font-bold text-rose-500 uppercase tracking-wider">{errors.paymentMethod.message}</p>}
                        </section>
                    </form>
                </div>

                {/* Resumen */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <div className="sticky top-32 space-y-6">
                        <section className="rounded-[2.5rem] bg-slate-950 p-8 md:p-10 text-white shadow-2xl">
                            <h3 className="mb-8 text-2xl font-black tracking-tight flex items-center justify-between">
                                Tu Pedido
                                <span className="text-[10px] font-bold text-orange-500 border border-orange-500/30 bg-orange-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{items.length} items</span>
                            </h3>
                            
                            <div className="max-h-[35vh] overflow-y-auto pr-2 no-scrollbar space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xl bg-slate-100">🥘</div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center">
                                            <p className="text-sm font-bold text-white line-clamp-1">{item.name}</p>
                                            <div className="mt-1 flex items-center justify-between">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">x{item.quantity}</p>
                                                <span className="text-sm font-bold text-white">Q{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4 border-t border-white/10 pt-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Subtotal Bruto</span>
                                    <span className="text-sm font-bold text-white">Q{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Envío Premium</span>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">GRATIS</span>
                                </div>
                                <div className="flex justify-between items-end pt-6 border-t border-white/10">
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">Q{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                className="mt-10 flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-orange-500 py-5 text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95"
                            >
                                Confirmar Pedido
                                <Check className="h-4 w-4" strokeWidth={3} />
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
