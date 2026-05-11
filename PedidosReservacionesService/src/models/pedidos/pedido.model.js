'use strict';
import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        usuario: {
            type: String,
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
            default: 0
        },
        cliente: {
            type: String,
            required: [true, 'El nombre del cliente es obligatorio']
        },
        email: {
            type: String,
            default: ''
        },
        telefono: {
            type: String,
            default: ''
        },
        direccionEntrega: {
            type: String,
            required: [true, 'La dirección de entrega es obligatoria']
        },
        notas: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

pedidoSchema.index({ restaurante: 1 });
pedidoSchema.index({ usuario: 1 });
pedidoSchema.index({ tipoPedido: 1 });
pedidoSchema.index({ estadoPedido: 1 });

export default mongoose.model('Pedido', pedidoSchema);