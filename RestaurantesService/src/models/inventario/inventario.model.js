'use strict';

import mongoose from 'mongoose';

const inventarioSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        nombreItem: {
            type: String,
            required: [true, 'El nombre del item es obligatorio'],
            trim: true,
            maxlength: 100,
        },
        cantidad: {
            type: Number,
            required: [true, 'La cantidad es obligatoria'],
            min: [0, 'La cantidad no puede ser negativa']
        },
        minStock: {
            type: Number,
            required: [true, 'El stock mínimo es obligatorio'],
            min: [0, 'El stock mínimo no puede ser negativo']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

inventarioSchema.index({ restaurante: 1, nombreItem: 1 });

export default mongoose.model('Inventario', inventarioSchema);