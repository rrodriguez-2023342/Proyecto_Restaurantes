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
        const loadData = async () => {
            try {
                setLoadingData(true);
                const [restRes, menusRes] = await Promise.all([
                    getRestaurants(),
                    getMenus({ limit: 1000, isActive: true }),
                ]);

                const restData = restRes?.data?.data || restRes?.data?.restaurantes || restRes?.data || [];
                const menuData = menusRes?.data?.data || menusRes?.data?.menus || menusRes?.data || [];
                const platoData = Array.isArray(menuData)
                    ? menuData.flatMap((menu) =>
                        (menu?.platos || []).map((plato) => ({
                            ...plato,
                            restauranteId:
                                menu?.restaurante?._id ||
                                menu?.restaurante?.id ||
                                menu?.restaurante ||
                                plato?.restaurante?._id ||
                                plato?.restaurante?.id ||
                                plato?.restaurante ||
                                "",
                            menu: {
                                ...(typeof plato?.menu === "object" ? plato.menu : {}),
                                _id: plato?.menu?._id || plato?.menu || menu?._id || menu?.id,
                                restaurante:
                                    plato?.menu?.restaurante ||
                                    menu?.restaurante,
                            },
                        }))
                    )
                    : [];
                
                setRestaurants(Array.isArray(restData) ? restData : []);
                setPlatos(platoData);

                if (!restData || restData.length === 0) {
                    showError("No hay restaurantes disponibles");
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || "Error al cargar datos";
                showError(errorMsg);
                console.error("Error cargando datos:", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    const handleAddItem = () => {
        if (!selectedRestaurant) {
            showError("Selecciona un restaurante primero");
            return;
        }
        append({
            plato: "",
            cantidad: 1,
            precioUnitario: 0,
        });
    };

    const handleUpdateItem = (index, plato) => {
        const selected = platos.find((p) => (p._id || p.id) === plato);
        update(index, {
            plato,
            cantidad: watchItems[index]?.cantidad || 1,
            precioUnitario: selected?.precio || 0,
        });
    };

    const handleUpdateQuantity = (index, quantity) => {
        if (quantity < 1) return;
        update(index, {
            ...itemFields[index],
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
                tipoPedido: "Domicilio",
                estadoPedido: "Pendiente",
            };

            const newOrder = await createOrder(orderPayload);
            const orderId = newOrder._id || newOrder.id;

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
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Crear Nuevo Pedido
                        </h1>
                        <p className="mt-1 text-slate-600">
                            Completa el formulario para crear un pedido
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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

                                    <div className="grid gap-4 md:grid-cols-2">
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
                                            className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-3"
                                        >
                                            <div className="flex items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="text-xs font-semibold text-slate-600 uppercase">
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
                                                        disabled={!selectedRestaurant}
                                                    >
                                                        <option value="">
                                                            Selecciona un plato
                                                        </option>
                                                        {restaurantPlatos.map((plato) => (
                                                            <option
                                                                key={plato._id || plato.id}
                                                                value={
                                                                    plato._id || plato.id
                                                                }
                                                            >
                                                                {plato.nombrePlato} - $
                                                                {plato.precio?.toFixed(
                                                                    2
                                                                )}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="w-24">
                                                    <label className="text-xs font-semibold text-slate-600 uppercase">
                                                        Cantidad
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
                                                    className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        disabled={!selectedRestaurant || restaurantPlatos.length === 0}
                                        className="w-full rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition disabled:opacity-50 disabled:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        + Agregar Artículo
                                    </button>
                                    {selectedRestaurant && restaurantPlatos.length === 0 && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                            No hay platos registrados para este restaurante.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Carrito/Resumen */}
                        <div className="space-y-6">
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

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/orders")}
                                    className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-400 hover:to-orange-500 transition disabled:opacity-50"
                                >
                                    {saving ? "Creando..." : "Crear Pedido"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
