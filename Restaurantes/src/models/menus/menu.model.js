'use strict';

import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante al que pertenece el menú es obligatorio']
        },
        nombreMenu: {
            type: String,
            required: [true, 'El nombre del menú es obligatorio'],
            maxlength: [100, 'El nombre del menú no puede exceder los 100 caracteres']
        },
        descripcionMenu: {
            type: String,
            required: [true, 'La descripción del menú es obligatoria'],
            maxlength: [500, 'La descripción del menú no puede exceder los 500 caracteres']
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

menuSchema.index({ restaurante: 1 });
menuSchema.index({ nombreMenu: 1 });

export default mongoose.model('Menu', menuSchema);