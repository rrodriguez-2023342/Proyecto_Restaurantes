'use strict';

import mongoose from "mongoose";

const detallePedidoSchema = new mongoose.Schema(
    {
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
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
        precio: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

detallePedidoSchema.index({ pedido: 1, plato: 1 })

export default mongoose.model('DetallePedido', detallePedidoSchema)