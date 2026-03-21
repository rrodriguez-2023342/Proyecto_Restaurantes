'use strict';

import mongoose from "mongoose";

const reservacionSchema = new mongoose.Schema(
    {
        usuario: {
            type: String, // Cambiado de ObjectId a String para aceptar IDs personalizados
            required: [true, 'El usuario que realiza la reservación es obligatorio']
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
            required: [true, 'La fecha de reservación es obligatoria']
        },
        cantidadPersonas: {
            type: Number,
            required: [true, 'El número de personas es obligatorio'],
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
        versionKey: false
    }
);

// Índices para mejorar el rendimiento de las búsquedas
reservacionSchema.index({ usuario: 1 });
reservacionSchema.index({ restaurante: 1 });
reservacionSchema.index({ mesa: 1 });
reservacionSchema.index({ fecha: 1 });
reservacionSchema.index({ estado: 1 });

export default mongoose.model('Reservacion', reservacionSchema);