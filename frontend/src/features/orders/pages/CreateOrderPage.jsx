import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { Card, FormField } from "../../../shared/components";
import { useOrderStore } from "../store/useOrderStore";
import { useDetailOrderStore } from "../../detailOrders/store/useDetailOrderStore";
import { getRestaurants } from "../../../shared/api";
import { getMenus } from "../../../shared/api";
import { Cart } from "../components/Cart.jsx";
import { showError, showSuccess } from "../../../shared/utils/toast";

export const CreateOrderPage = () => {
    const navigate = useNavigate();
    const { createOrder } = useOrderStore();
    const { createDetailOrder } = useDetailOrderStore();
    const [restaurants, setRestaurants] = useState([]);
    const [menus, setMenus] = useState([]);
    const [platos, setPlatos] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            restaurante: "",
            cliente: "",
            email: "",
            telefono: "",
            direccionEntrega: "",
            items: [],
            notas: "",
        },
    });

    const { fields: itemFields, append, remove, update, replace } = useFieldArray({
        control,
        name: "items",
    });

    const watchItems = useWatch({ control, name: "items" }) || [];

    const { subtotal, tax, total } = useMemo(() => {
        const sub = watchItems.reduce(
            (sum, item) => sum + ((item.precioUnitario || 0) * (item.cantidad || 0)),
            0
        );
        const taxAmount = sub * 0.1; // Asumiendo 10% de impuesto
        return {
            subtotal: sub,
            tax: taxAmount,
            total: sub + taxAmount,
        };
    }, [watchItems]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                setLoadingData(true);
                const { data } = await getRestaurants();
                const restData = data?.data || data?.restaurantes || data || [];
                setRestaurants(Array.isArray(restData) ? restData : []);
                if (!restData || restData.length === 0) {
                    showError("No hay restaurantes disponibles");
                }
            } catch (err) {
                showError("Error al cargar restaurantes");
            } finally {
                setLoadingData(false);
            }
        };
        loadRestaurants();
    }, []);

    useEffect(() => {
        if (!selectedRestaurant) {
            setMenus([]);
            setPlatos([]);
            return;
        }

        const loadMenusAndPlatos = async () => {
            try {
                setLoadingData(true);
                const { data } = await getMenus({ 
                    restaurante: selectedRestaurant, 
                    limit: 1000, 
                    isActive: true 
                });
                const loadedMenus = data?.data || data?.menus || data || [];
                setMenus(loadedMenus);
                
                // Extraer todos los platos de todos los menús del restaurante
                const allPlatos = Array.isArray(loadedMenus)
                    ? loadedMenus.flatMap(m => (m.platos || []).map(p => ({ ...p, menuId: m._id || m.id })))
                    : [];
                setPlatos(allPlatos);
            } catch (err) {
                showError("No se pudieron cargar los datos del restaurante");
            } finally {
                setLoadingData(false);
            }
        };
        loadMenusAndPlatos();
    }, [selectedRestaurant]);

    const handleAddItem = () => {
        if (!selectedRestaurant) {
            showError("Selecciona un restaurante primero");
            return;
        }
        append({
            menu: "",
            plato: "",
            cantidad: 1,
            precioUnitario: 0,
        });
    };

    const handleUpdateItem = (index, plato) => {
        const selected = platos.find((p) => (p._id || p.id) === plato);
        const currentItem = watchItems[index];
        update(index, {
            ...currentItem,
            plato,
            precioUnitario: selected?.precio || 0,
        });
    };

    const handleUpdateQuantity = (index, quantity) => {
        if (quantity < 1) return;
        const currentItem = watchItems[index];
        update(index, {
            ...currentItem,
            cantidad: quantity,
        });
    };

    const onSubmit = async (values) => {
        try {
            if (!values.items.length) {
                showError("Agrega al menos un artículo");
                return;
            }

            setSaving(true);

            // Crear pedido
            const orderPayload = {
                restaurante: values.restaurante,
                cliente: values.cliente,
                email: values.email || "",
                telefono: values.telefono || "",
                direccionEntrega: values.direccionEntrega,
                notas: values.notas || "",
                tipoPedido: "Domicilio",
                estadoPedido: "Pendiente",
            };

            const newOrder = await createOrder(orderPayload);
            const orderId = newOrder._id || newOrder.id || newOrder.data?._id;

            const detailPayload = {
                pedido: orderId,
                items: values.items.map((item) => ({
                    plato: item.plato,
                    cantidad: item.cantidad,
                    precio: item.precioUnitario,
                })),
            };
            await createDetailOrder(detailPayload);

            showSuccess("Pedido creado correctamente");
            navigate("/admin/orders");
        } catch (err) {
            const resp = err.response?.data;
            const message = resp?.message || resp?.error || "Error al crear pedido";
            showError(message);
        } finally {
            setSaving(false);
        }
    };

    const restaurantPlatos = selectedRestaurant
        ? platos.filter((p) => String(p.restauranteId || "") === String(selectedRestaurant))
        : [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                            Crear Nuevo Pedido
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 sm:text-base">
                            Completa el formulario para crear un pedido
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="w-full sm:w-auto rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        ← Volver
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información del Restaurante y Cliente */}
                            <Card title="Información General">
                                <div className="space-y-4">
                                    <FormField
                                        label="Restaurante *"
                                        error={errors.restaurante?.message}
                                    >
                                        <select
                                            {...register("restaurante", {
                                                required: "El restaurante es obligatorio",
                                            })}
                                            onChange={(e) => {
                                                register("restaurante").onChange(e);
                                                setSelectedRestaurant(e.target.value);
                                                replace([]);
                                            }}
                                            disabled={loadingData || restaurants.length === 0}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingData ? "Cargando restaurantes..." : "Selecciona un restaurante"}
                                            </option>
                                            {restaurants.map((rest) => (
                                                <option
                                                    key={rest._id || rest.id}
                                                    value={rest._id || rest.id}
                                                >
                                                    {rest.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField
                                        label="Nombre del Cliente *"
                                        error={errors.cliente?.message}
                                    >
                                        <input
                                            {...register("cliente", {
                                                required: "El nombre del cliente es obligatorio",
                                            })}
                                            placeholder="Juan Pérez"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                        />
                                    </FormField>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            label="Email"
                                            error={errors.email?.message}
                                        >
                                            <input
                                                {...register("email", {
                                                    pattern: {
                                                        value:
                                                            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
                                                        message:
                                                            "Email inválido",
                                                    },
                                                })}
                                                type="email"
                                                placeholder="juan@example.com"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                            />
                                        </FormField>

                                        <FormField
                                            label="Teléfono"
                                            error={errors.telefono?.message}
                                        >
                                            <input
                                                {...register("telefono")}
                                                placeholder="+56 9 1234 5678"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                            />
                                        </FormField>
                                    </div>

                                    <FormField
                                        label="Dirección de Entrega *"
                                        error={errors.direccionEntrega?.message}
                                    >
                                        <textarea
                                            {...register("direccionEntrega", {
                                                required: "La dirección es obligatoria",
                                            })}
                                            placeholder="Calle, número, apartamento..."
                                            rows={2}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                        />
                                    </FormField>

                                    <FormField label="Notas (opcional)">
                                        <textarea
                                            {...register("notas")}
                                            placeholder="Instrucciones especiales..."
                                            rows={2}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-orange-400 focus:outline-none"
                                        />
                                    </FormField>
                                </div>
                            </Card>

                            {/* Artículos del Pedido */}
                            <Card title="Artículos del Pedido">
                                <div className="space-y-4">
                                    {itemFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-4"
                                        >
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
                                                <div className="sm:col-span-1 lg:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Menú
                                                    </label>
                                                    <select
                                                        {...register(`items.${index}.menu`, {
                                                            required: "Selecciona un menú",
                                                        })}
                                                        onChange={(e) => {
                                                            const menuId = e.target.value;
                                                            update(index, {
                                                                ...watchItems[index],
                                                                menu: menuId,
                                                                plato: "",
                                                                precioUnitario: 0
                                                            });
                                                        }}
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none mt-1"
                                                        disabled={!selectedRestaurant}
                                                    >
                                                        <option value="">Selecciona un menú</option>
                                                        {menus.map((m) => (
                                                            <option key={m._id || m.id} value={m._id || m.id}>
                                                                {m.nombreMenu || m.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="sm:col-span-1 lg:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Plato
                                                    </label>
                                                    <select
                                                        {...register(`items.${index}.plato`, {
                                                            required: "Selecciona un plato",
                                                        })}
                                                        onChange={(e) =>
                                                            handleUpdateItem(index, e.target.value)
                                                        }
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none mt-1"
                                                        disabled={!watchItems[index]?.menu}
                                                    >
                                                        <option value="">
                                                            {watchItems[index]?.menu ? "Selecciona un plato" : "Primero elige un menú"}
                                                        </option>
                                                        {platos
                                                            .filter(p => p.menuId === watchItems[index]?.menu)
                                                            .map((plato) => (
                                                                <option
                                                                    key={plato._id || plato.id}
                                                                    value={plato._id || plato.id}
                                                                >
                                                                    {plato.nombrePlato} - Q{plato.precio?.toFixed(2)}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>

                                                <div className="flex items-end gap-2 lg:col-span-1">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            Cant.
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            {...register(`items.${index}.cantidad`, {
                                                                min: 1,
                                                            })}
                                                            onChange={(e) =>
                                                                handleUpdateQuantity(
                                                                    index,
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-orange-400 focus:outline-none mt-1"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="rounded-lg bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100 transition"
                                                        title="Eliminar artículo"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        disabled={!selectedRestaurant || (platos.length === 0 && !loadingData)}
                                        className="w-full rounded-xl border-2 border-dashed border-orange-400 bg-orange-50/50 py-4 text-sm font-bold text-orange-600 hover:bg-orange-100/50 transition disabled:opacity-50 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300"
                                    >
                                        + Agregar Artículo al Pedido
                                    </button>
                                    {selectedRestaurant && platos.length === 0 && !loadingData && (
                                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                            No hay platos registrados para este restaurante.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Carrito/Resumen */}
                        <div className="space-y-6">
                            <div className="sticky top-6">
                                <Cart
                                    items={itemFields.map((field, index) => ({
                                        ...field,
                                        nombrePlato:
                                            platos.find(
                                                (plato) =>
                                                    (plato._id || plato.id) === watchItems[index]?.plato
                                            )?.nombrePlato || "",
                                        precioUnitario: watchItems[index]?.precioUnitario,
                                        cantidad: watchItems[index]?.cantidad,
                                        subtotal:
                                            watchItems[index]?.cantidad *
                                            watchItems[index]?.precioUnitario,
                                    }))}
                                    subtotal={subtotal}
                                    tax={tax}
                                    total={total}
                                    isEditable={false}
                                />

                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-sm font-bold text-white shadow-lg shadow-orange-100 hover:shadow-orange-200 transition disabled:opacity-50"
                                    >
                                        {saving ? "Procesando..." : "Finalizar y Crear Pedido"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/orders")}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
