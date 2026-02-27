    'use strict';

    import mongoose from "mongoose";

    const restauranteSchema = new mongoose.Schema(
        {
            nombre: {
                type: String,
                required: [true, 'El nombre del restaurante es obligatorio'],
                maxlength: [100, 'El nombre del restaurante no puede exceder los 100 caracteres'],
                trim: true
            },
            descripcion: {
                type: String,
                required: [true, 'La descripción del restaurante es obligatoria'],
                maxlength: [500, 'La descripción del restaurante no puede exceder los 500 caracteres']
            },
            direccion: {
                type: String,
                required: [true, 'La dirección del restaurante es obligatoria'],
                maxlength: [200, 'La dirección del restaurante no puede exceder los 200 caracteres']
            },
            categoria: {
                type: String,
                required: [true, 'La categoría del restaurante es obligatoria']
            },
            telefono: {
                type: String,
                required: [true, 'El número de teléfono del restaurante es obligatorio']
            },
            fotos: {
                type: String,
                default: null
            },
            dueño: {
            type: String, // Cambiamos ObjectId por String
            required: true
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
    );

    restauranteSchema.index({ isActive: 1 });
    restauranteSchema.index({ nombre: 1 });
    restauranteSchema.index({ dueño: 1 });

    export default mongoose.model('Restaurante', restauranteSchema);