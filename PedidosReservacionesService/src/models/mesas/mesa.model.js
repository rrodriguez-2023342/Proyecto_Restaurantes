'use strict';

import mongoose from "mongoose";

const mesaSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante al que pertenece la mesa es obligatorio']
        },
        numeroMesa: {
            type: Number,
            required: [true, 'El número de mesa es obligatorio'],
            min: [1, 'El número de mesa debe ser al menos 1']
        },
        capacidad: {
            type: Number,
            required: [true, 'La capacidad de la mesa es obligatoria'],
            min: [1, 'La capacidad de la mesa debe ser al menos 1']
        },
        disponibilidad: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

mesaSchema.index({ restaurante: 1, numeroMesa: 1 }, { unique: true });

export default mongoose.model('Mesa', mesaSchema);