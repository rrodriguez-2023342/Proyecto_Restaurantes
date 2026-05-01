'use strict';

import mongoose from 'mongoose';

const reservacionSchema = new mongoose.Schema(
    {
        usuario: {
            type: String,
            required: [true, 'El usuario que realiza la reservacion es obligatorio']
        },
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante es obligatorio']
        },
        mesa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mesa',
            required: [true, 'La mesa es obligatoria']
        },
        fecha: {
            type: Date,
            required: [true, 'La fecha de reservacion es obligatoria']
        },
        cantidadPersonas: {
            type: Number,
            required: [true, 'El numero de personas es obligatorio'],
            min: [1, 'Debe haber al menos 1 persona']
        },
        estado: {
            type: String,
            enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'],
            default: 'PENDIENTE'
        }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'reservacions'
    }
);

reservacionSchema.index({ mesa: 1 });
reservacionSchema.index({ estado: 1 });

export default mongoose.models.Reservacion || mongoose.model('Reservacion', reservacionSchema);
