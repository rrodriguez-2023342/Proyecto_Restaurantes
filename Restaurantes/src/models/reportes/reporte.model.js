'use strict';

import mongoose from 'mongoose';

const reporteSchema = new mongoose.Schema(
    {
        restaurante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: true
        },
        tipoReporte: {
            enum: ["VENTAS", "RESERVACIONES", "INVENTARIO", "CLIENTES"]
        },
        data: {
            type: Object
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

reporteSchema.index({ restaurante: 1, tipoReporte: 1 });

export default mongoose.model('Reporte', reporteSchema);