'use strict';
import mongoose from "mongoose";

const horarioSchema = new mongoose.Schema(
    {
        apertura: {
            type: String,
            required: [true, 'La hora de apertura es obligatoria'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido, use HH:MM']
        },
        cierre: {
            type: String,
            required: [true, 'La hora de cierre es obligatoria'],
            match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido, use HH:MM']
        },
        diasAbierto: {
            type: [String],
            enum: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            default: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']
        }
    },
    { _id: false }
);

const direccionSchema = new mongoose.Schema(
    {
        calle:        { type: String, required: [true, 'La calle es obligatoria'], trim: true },
        zona:         { type: String, trim: true, default: null },
        ciudad:       { type: String, required: [true, 'La ciudad es obligatoria'], trim: true },
        departamento: { type: String, trim: true, default: null },
        pais:         { type: String, default: 'Guatemala', trim: true },
        referencia:   { type: String, maxlength: [300, 'La referencia no puede exceder 300 caracteres'], default: null }
    },
    { _id: false }
);

const restauranteSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
            trim: true
        },
        descripcion: {
            type: String,
            required: [true, 'La descripción es obligatoria'],
            maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
        },
        direccion: {
            type: direccionSchema,
            required: [true, 'La dirección es obligatoria']
        },
        categoria: {
            type: String,
            required: [true, 'La categoría es obligatoria'],
            enum: [
                'Italiana', 'Mexicana', 'Guatemalteca', 'Americana', 'China',
                'Japonesa', 'Francesa', 'Mariscos', 'Vegetariana', 'Cafetería',
                'Panadería', 'Fusión', 'Otro'
            ]
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono es obligatorio'],
            trim: true
        },
        correo: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'El correo no es válido'],
            default: null
        },
        horario: {
            type: horarioSchema,
            default: null
        },
        // Calculado automáticamente desde los platos del menú
        precioPromedio: {
            type: Number,
            min: [0, 'El precio promedio no puede ser negativo'],
            default: null
        },
        fotos: {
            type: String,
            default: null
        },
        dueño: {
            type: String,
            required: [true, 'El dueño es obligatorio']
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
restauranteSchema.index({ categoria: 1 });

export default mongoose.model('Restaurante', restauranteSchema);