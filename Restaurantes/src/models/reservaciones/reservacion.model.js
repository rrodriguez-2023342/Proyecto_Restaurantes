'use strict';

import mongoose from "mongoose";

const reservacionSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        mesa: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mesa',
            required: true
        },
        fechaReservacion: {
            type: Date,
            required: [true, 'La fecha de reservación es obligatoria']
        },
        horaReservacion: {
            type: String,
            required: [true, 'La hora de reservación es obligatoria']
        },
        personasReservacion: {
            type: Number,
            required: [true, 'El número de personas para la reservación es obligatorio']
        },
        estado: {
            type: String,
            enum: ['Confirmada', 'Cancelada', 'Completada', 'Pendiente'],
            default: 'Confirmada'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, 
    {
        timestamps: true,
        versionKey: false
    }
)

reservacionSchema.index({ restaurante: 1 });
reservacionSchema.index({ mesa: 1 });
reservacionSchema.index({ fechaReservacion: 1 });
reservacionSchema.index({ estado: 1 });

export default mongoose.model('Reservacion', reservacionSchema);