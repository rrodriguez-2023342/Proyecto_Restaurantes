'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js'
import { helmetConfiguration } from './helmet-configuration.js'

import restauranteRoutes from '../src/models/restaurantes/restaurante.routes.js';
import mesaRoutes from '../src/models/mesas/mesa.routes.js';
import menuRoutes from '../src/models/menus/menu.routes.js';
import platoRoutes from '../src/models/platos/plato.routes.js';
import reservacionRoutes from '../src/models/reservaciones/reservacion.routes.js';
import pedidoRoutes from '../src/models/pedidos/pedido.routes.js';
import detallePedidoRoutes from '../src/models/detallePedidos/detallePedido.routes.js';
import eventoRoutes from '../src/models/eventos/evento.routes.js';
import reseñaRoutes from '../src/models/reseñas/reseña.routes.js';
import inventarioRoutes from '../src/models/inventario/inventario.routes.js';
import facturaRoutes from '../src/models/facturas/factura.routes.js';
import reporteRoutes from '../src/models/reportes/reporte.routes.js';

const BASE_PATH = '/restaurantes/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({extended: false, limit: '10mb'}));
    app.use(express.json({limit: '10mb'}));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
}

const routes = (app) => {

    app.use(`${BASE_PATH}/restaurantes`, restauranteRoutes);
    app.use(`${BASE_PATH}/mesas`, mesaRoutes);
    app.use(`${BASE_PATH}/menus`, menuRoutes);
    app.use(`${BASE_PATH}/platos`, platoRoutes);
    app.use(`${BASE_PATH}/reservaciones`, reservacionRoutes);
    app.use(`${BASE_PATH}/pedidos`, pedidoRoutes);
    app.use(`${BASE_PATH}/detalle-pedidos`, detallePedidoRoutes);
    app.use(`${BASE_PATH}/eventos`, eventoRoutes);
    app.use(`${BASE_PATH}/resenas`, reseñaRoutes);
    app.use(`${BASE_PATH}/inventarios`, inventarioRoutes);
    app.use(`${BASE_PATH}/facturas`, facturaRoutes);
    app.use(`${BASE_PATH}/reportes`, reporteRoutes);

    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp : new Date().toISOString(),
            service: 'Restaurantes Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Enpoint no encontrado'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trus proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        })
    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
}