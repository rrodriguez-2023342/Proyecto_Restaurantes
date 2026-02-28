'use strict';

import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        plato: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plato',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        usuario: {
            type: String, // almacenamos el id tal como viene del token
            required: true
        },
        tipoPedido: {
            type: String,
            enum: ['Domicilio', 'Para llevar', 'En el restaurante'],
            required: true
        },
        estadoPedido: {
            type: String,
            enum: ['Pendiente', 'En preparación', 'Listo para entrega', 'Entregado', 'Cancelado'],
            default: 'Pendiente'
        },
        totalPedido: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

pedidoSchema.index({ restaurante: 1 });
pedidoSchema.index({ plato: 1 });
pedidoSchema.index({ usuario: 1 });
pedidoSchema.index({ tipoPedido: 1 });
pedidoSchema.index({ estadoPedido: 1 });

export default mongoose.model('Pedido', pedidoSchema);