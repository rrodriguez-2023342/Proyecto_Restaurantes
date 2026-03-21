'use strict';

import mongoose from "mongoose";

const eventoSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        titulo: {
            type: String,
            required: true,
        },
        descripcion: {
            type: String,
        },
        fechaEvento: {
            type: Date,
            required: true
        }   
    },
    {
        timestamps: true,
        versionKey: false
    }
)

eventoSchema.index({ restaurante: 1, titulo: 1, fechaEvento: 1 });

export default mongoose.model('Evento', eventoSchema);