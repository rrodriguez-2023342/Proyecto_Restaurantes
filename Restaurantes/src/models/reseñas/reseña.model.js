'use strict';

import mongoose from "mongoose";

const reseñaSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        comentario: {
            type: String,
            maxLength: [500, 'El comentario no puede exceder los 500 caracteres']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

reseñaSchema.index({ restaurante: 1 });

export default mongoose.model('Reseña', reseñaSchema);