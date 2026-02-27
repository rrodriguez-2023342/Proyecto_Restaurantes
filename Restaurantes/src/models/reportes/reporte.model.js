'use strict';
import mongoose from 'mongoose';

const reporteSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante es obligatorio'],
        },
        tipoReporte: {
            type: String,
            required: [true, 'El tipo de reporte es obligatorio'],
            enum: ['VENTAS', 'RESERVACIONES', 'INVENTARIO', 'PLATOS_POPULARES'],
        },
        fechaInicio: {
            type: Date,
            required: [true, 'La fecha de inicio es obligatoria'],
        },
        fechaFin: {
            type: Date,
            required: [true, 'La fecha de fin es obligatoria'],
        },
        data: {
            type: Object,
            default: {},
        },
        generadoPor: {
            userId: {
                type: String,
                required: [true, 'El usuario que genera el reporte es obligatorio'],
                immutable: true,
                trim: true,
            },
            role: {
                type: String,
                enum: ['ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE', 'USER_ROLE'],
                immutable: true,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

reporteSchema.index({ restaurante: 1, tipoReporte: 1 });
reporteSchema.index({ createdAt: -1 });
reporteSchema.index({ 'generadoPor.userId': 1 });

export default mongoose.model('Reporte', reporteSchema);