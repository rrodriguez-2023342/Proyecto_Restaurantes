'use strict';

import mongoose from "mongoose";

const platoSchema = new mongoose.Schema(
    {
        menu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Menu',
            required: [true, 'El menú al que pertenece el plato es obligatorio']
        },
        nombrePlato: {
            type: String,
            required: [true, 'El nombre del plato es obligatorio'],
            maxlength: [100, 'El nombre del plato no puede exceder los 100 caracteres'],
            trim: true
        },
        descripcionPlato: {
            type: String,
            required: [true, 'La descripción del plato es obligatoria'],
            maxlength: [500, 'La descripción del plato no puede exceder los 500 caracteres']
        },
        precio: {
            type: Number,
            required: [true, 'El precio del plato es obligatorio'],
            min: [0, 'El precio del plato no puede ser negativo']
        },
        tipoPlato: {
            type: String,
            required: [true, 'El tipo del plato es obligatorio'],
            enum: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA']
        },
        disponible: {
            type: Boolean,
            default: true
        },
        fotosPlato: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

platoSchema.index({ menu: 1 });
platoSchema.index({ nombrePlato: 1 });
platoSchema.index({ tipoPlato: 1 });
platoSchema.index({ disponible: 1 });

export default mongoose.model('Plato', platoSchema);