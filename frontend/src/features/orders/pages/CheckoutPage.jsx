
import { useCartStore } from "../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createOrder } from "../../../shared/api";
import { showError } from "../../../shared/utils/toast";
import { useAuthStore } from "../../auth/store/authStore";
import toast from "react-hot-toast";

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
            // Formatear items para la API
            const orderItems = items.map(item => ({
                plato: item.id,
                cantidad: item.quantity,
                precio: item.price
            }));

            const payload = {
                restaurante: restaurantId,
                items: orderItems,
                direccionEntrega: data.address,
                notas: data.notes,
                metodoPago: data.paymentMethod,
                tipoPedido: 'Domicilio', // Por defecto para esta vista
                cliente: `${user?.name || ''} ${user?.surname || ''}`.trim() || 'Cliente Web',
                email: user?.email,
                telefono: data.phone || ''
            };

            await createOrder(payload);
            
            toast.success("¡Pedido realizado con éxito!", {
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
        <div className="mx-auto max-w-6xl pb-10">
            <h1 className="mb-6 md:mb-10 text-3xl md:text-4xl font-black text-slate-900 tracking-tight px-2 md:px-0">Finalizar Pedido</h1>
            
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Formulario */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                        {/* Dirección */}
                        <section className="rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 border border-slate-100 shadow-sm">
                            <div className="mb-4 md:mb-6 flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900">Dirección de Entrega</h3>
                            </div>
                            <textarea
                                {...register("address", { required: "La dirección es obligatoria" })}
                                placeholder="Escribe tu dirección completa aquí..."
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm focus:border-orange-400 focus:outline-none min-h-[100px]"
                            />
                            {errors.address && <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.address.message}</p>}
                        </section>

                        {/* Teléfono */}
                        <section className="rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 border border-slate-100 shadow-sm">
                            <div className="mb-4 md:mb-6 flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900">Teléfono de Contacto</h3>
                            </div>
                            <input
                                type="tel"
                                {...register("phone", { required: "El teléfono es necesario" })}
                                placeholder="Ej: 5555-5555"
                                className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm focus:border-orange-400 focus:outline-none"
                            />
                            {errors.phone && <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.phone.message}</p>}
                        </section>

                        {/* Método de Pago */}
                        <section className="rounded-3xl md:rounded-[2.5rem] bg-white p-6 md:p-8 border border-slate-100 shadow-sm">
                            <div className="mb-4 md:mb-6 flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900">Método de Pago</h3>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {['Efectivo', 'Tarjeta'].map((method) => (
                                    <label key={method} className="relative flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/50">
                                        <input
                                            type="radio"
                                            value={method}
                                            {...register("paymentMethod", { required: "Selecciona uno" })}
                                            className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-bold text-slate-900">{method}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.paymentMethod && <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.paymentMethod.message}</p>}
                        </section>
                    </form>
                </div>

                {/* Resumen */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 md:top-28 space-y-6">
                        <section className="rounded-3xl md:rounded-[2.5rem] bg-slate-900 p-6 md:p-8 text-white shadow-2xl">
                            <h3 className="mb-6 md:mb-8 text-lg md:text-xl font-bold tracking-tight">Resumen del Pedido</h3>
                            <div className="max-h-[30vh] overflow-y-auto pr-2 no-scrollbar space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs md:text-sm font-bold">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">x{item.quantity}</p>
                                        </div>
                                        <span className="text-xs md:text-sm font-black text-orange-400">Q{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-white">Q{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs md:text-sm">
                                    <span className="font-bold text-slate-400 uppercase tracking-widest">Envío</span>
                                    <span className="font-black text-green-400">GRATIS</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-white/20">
                                    <span className="text-lg md:text-xl font-black">Total</span>
                                    <span className="text-2xl md:text-3xl font-black text-orange-500">Q{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                form="checkout-form"
                                type="submit"
                                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 py-4 md:py-5 text-sm font-black text-white shadow-xl shadow-orange-900/40 transition hover:bg-orange-400 active:scale-95"
                            >
                                Confirmar Pedido
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </section>
                        
                        <div className="rounded-2xl bg-orange-50 p-4 md:p-6 border border-orange-100 flex items-center gap-4">
                            <div className="h-8 w-8 flex-shrink-0 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm">!</div>
                            <p className="text-[10px] md:text-xs font-bold text-orange-800 leading-relaxed">
                                Procesaremos tu pedido de inmediato al confirmar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
