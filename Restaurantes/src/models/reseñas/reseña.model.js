'use strict';

import mongoose from 'mongoose';

const reseñaSchema = new mongoose.Schema(
    {
        usuario: {
            type: String, // Cambiado de ObjectId a String para aceptar IDs tipo "usr_..."
            required: [true, 'El usuario que califica es obligatorio']
        },
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante a calificar es obligatorio']
        },
        comentario: {
            type: String,
            required: [true, 'El comentario es obligatorio'],
            maxlength: [500, 'El comentario no puede exceder los 500 caracteres']
        },
        calificacion: {
            type: Number,
            required: [true, 'La calificación es obligatoria'],
            min: 1,
            max: 5
        },
        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Índices para optimizar las búsquedas en la base de datos
reseñaSchema.index({ restaurante: 1 });
reseñaSchema.index({ usuario: 1 });
reseñaSchema.index({ estado: 1 });

export default mongoose.model('Reseña', reseñaSchema);