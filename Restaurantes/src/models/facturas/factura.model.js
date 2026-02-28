'use strict';

import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema(
    {
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'El subtotal no puede ser negativo'],
        },
        impuesto: {
            type: Number,
            default: 0,
            min: [0, 'El impuesto no puede ser negativo'],
        },
        total: {
            type: Number,
            min: [0, 'El total no puede ser negativo'],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Calcula el total automáticamente antes de guardar
facturaSchema.pre('save', async function () {
    this.total = parseFloat(((this.subtotal ?? 0) + (this.impuesto ?? 0)).toFixed(2));
});

facturaSchema.index({ pedido: 1 });

export default mongoose.model('Factura', facturaSchema);