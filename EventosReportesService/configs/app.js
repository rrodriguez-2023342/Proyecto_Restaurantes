'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
// Swagger se usa para mostrar la documentacion del servicio.
import { setupSwagger } from './swagger.js';

import eventoRoutes from '../src/models/eventos/evento.routes.js';
import reporteRoutes from '../src/models/reportes/reporte.routes.js';

const BASE_PATH = '/restaurantes/v1';
const SERVICE_NAME = 'EventosReportesService';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
};

const routes = (app) => {
    app.use(`${BASE_PATH}/eventos`, eventoRoutes);
    app.use(`${BASE_PATH}/reportes`, reporteRoutes);

    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: SERVICE_NAME
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Enpoint no encontrado'
        });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trus proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        // Aqui se activa la documentacion en /restaurantes/v1/docs
        setupSwagger(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Service: ${SERVICE_NAME}`);
        });
    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
};





