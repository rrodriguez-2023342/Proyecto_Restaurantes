'use strict';
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
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
    { _id: false }
);

const detallePedidoSchema = new mongoose.Schema(
    {
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
            required: true
        },
        items: {
            type: [itemSchema],
            required: true,
            validate: {
                validator: (arr) => arr.length > 0,
                message: 'Debe haber al menos un item en el detalle'
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

detallePedidoSchema.index({ pedido: 1 });

export default mongoose.model('DetallePedido', detallePedidoSchema);