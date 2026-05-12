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
        propina: {
            type: Number,
            default: 0,
            min: [0, 'La propina no puede ser negativo'],
        },
        total: {
            type: Number,
            min: [0, 'El total no puede ser negativo'],
        },
        correoCliente: {
            type: String,
            default: null,
        },
        metodoPago: {
            type: String,
            default: null,
        },
        estado: {
            type: String,
            enum: ['PENDIENTE', 'ENTREGADO', 'PAGADA', 'ANULADA'],
            default: 'PENDIENTE',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

facturaSchema.pre('save', async function () {
    this.total = parseFloat(((this.subtotal ?? 0) + (this.propina ?? 0)).toFixed(2));
    if (!this.estado) {
        this.estado = 'PENDIENTE';
    }
});

facturaSchema.index({ pedido: 1 });

export default mongoose.model('Factura', facturaSchema);