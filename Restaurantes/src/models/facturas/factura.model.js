'use strict';

import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema(
    {
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
            required: true
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'El subtotal no puede ser negativo']
        },
        impuesto: {
            type: Number,
            min: [0, 'El impuesto no puede ser negativo']
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'El total no puede ser negativo']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

facturaSchema.index({ pedido: 1 });

export default mongoose.model('Factura', facturaSchema);