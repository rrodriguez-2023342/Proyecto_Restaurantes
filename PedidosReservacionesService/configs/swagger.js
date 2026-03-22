import swaggerUi from 'swagger-ui-express';

// Ruta base del servicio y ruta final para abrir Swagger.
const BASE_PATH = '/restaurantes/v1';
const DOCS_PATH = `${BASE_PATH}/docs`;

// Aqui describimos a mano los endpoints importantes del servicio.
// Asi la documentacion queda separada del codigo de negocio.
const createSpec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'PedidosReservacionesService API',
        version: '1.0.0',
        description: 'Documentacion del microservicio de pedidos, detalle de pedidos, reservaciones y facturas.'
    },
    servers: [
        { url: `http://localhost:${process.env.PORT || 3008}${BASE_PATH}`, description: 'Local' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    },
    tags: [
        { name: 'Pedidos' },
        { name: 'DetallePedidos' },
        { name: 'Reservaciones' },
        { name: 'Facturas' },
        { name: 'Health' }
    ],
    paths: {
        '/pedidos/create': { post: { tags: ['Pedidos'], summary: 'Crear pedido', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Pedido creado' } } } },
        '/pedidos/': { get: { tags: ['Pedidos'], summary: 'Listar pedidos', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Pedidos listados' } } } },
        '/pedidos/{id}': {
            get: { tags: ['Pedidos'], summary: 'Obtener pedido por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Pedido obtenido' } } },
            put: { tags: ['Pedidos'], summary: 'Actualizar pedido', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Pedido actualizado' } } },
            delete: { tags: ['Pedidos'], summary: 'Eliminar pedido', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Pedido eliminado' } } }
        },
        '/detalle-pedidos/create': { post: { tags: ['DetallePedidos'], summary: 'Crear detalle de pedido', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Detalle creado' } } } },
        '/detalle-pedidos/': { get: { tags: ['DetallePedidos'], summary: 'Listar detalles de pedido', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Detalles listados' } } } },
        '/detalle-pedidos/pedido/{pedidoId}': { get: { tags: ['DetallePedidos'], summary: 'Obtener detalle por pedido', security: [{ bearerAuth: [] }], parameters: [{ name: 'pedidoId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Detalle obtenido' } } } },
        '/detalle-pedidos/{id}': {
            get: { tags: ['DetallePedidos'], summary: 'Obtener detalle por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Detalle obtenido' } } },
            put: { tags: ['DetallePedidos'], summary: 'Actualizar detalle', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Detalle actualizado' } } },
            delete: { tags: ['DetallePedidos'], summary: 'Eliminar detalle', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Detalle eliminado' } } }
        },
        '/reservaciones/create': { post: { tags: ['Reservaciones'], summary: 'Crear reservacion', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Reservacion creada' } } } },
        '/reservaciones/': { get: { tags: ['Reservaciones'], summary: 'Listar reservaciones', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Reservaciones listadas' } } } },
        '/reservaciones/{id}': {
            get: { tags: ['Reservaciones'], summary: 'Obtener reservacion por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reservacion obtenida' } } },
            put: { tags: ['Reservaciones'], summary: 'Actualizar reservacion', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reservacion actualizada' } } },
            delete: { tags: ['Reservaciones'], summary: 'Eliminar reservacion', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reservacion eliminada' } } }
        },
        '/facturas': {
            post: { tags: ['Facturas'], summary: 'Crear factura', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Factura creada' } } },
            get: { tags: ['Facturas'], summary: 'Listar facturas', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Facturas listadas' } } }
        },
        '/facturas/{id}': {
            get: { tags: ['Facturas'], summary: 'Obtener factura por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Factura obtenida' } } },
            put: { tags: ['Facturas'], summary: 'Actualizar factura', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Factura actualizada' } } },
            delete: { tags: ['Facturas'], summary: 'Eliminar factura', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Factura eliminada' } } }
        },
        '/facturas/{id}/pdf': { get: { tags: ['Facturas'], summary: 'Descargar factura PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF generado' } } } },
        '/Health': { get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'Servicio saludable' } } } }
    }
});

export const setupSwagger = (app) => {
    // Se publica la interfaz y tambien el spec en formato JSON.
    const spec = createSpec();
    app.use(DOCS_PATH, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
    app.get(`${DOCS_PATH}.json`, (req, res) => res.json(spec));
};

