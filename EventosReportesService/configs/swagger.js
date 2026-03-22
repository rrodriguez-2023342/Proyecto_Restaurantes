import swaggerUi from 'swagger-ui-express';

// Ruta base del microservicio y ruta donde se vera la documentacion.
const BASE_PATH = '/restaurantes/v1';
const DOCS_PATH = `${BASE_PATH}/docs`;

// Este archivo guarda el spec OpenAPI del servicio.
// Lo deje aparte para que el app.js no quede tan cargado.
const createSpec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'EventosReportesService API',
        version: '1.0.0',
        description: 'Documentacion del microservicio de eventos y reportes.'
    },
    servers: [
        { url: `http://localhost:${process.env.PORT || 3009}${BASE_PATH}`, description: 'Local' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    },
    tags: [
        { name: 'Eventos' },
        { name: 'Reportes' },
        { name: 'Health' }
    ],
    paths: {
        '/eventos/create': { post: { tags: ['Eventos'], summary: 'Crear evento', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Evento creado' } } } },
        '/eventos/': { get: { tags: ['Eventos'], summary: 'Listar eventos', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Eventos listados' } } } },
        '/eventos/{id}': {
            get: { tags: ['Eventos'], summary: 'Obtener evento por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Evento obtenido' } } },
            put: { tags: ['Eventos'], summary: 'Actualizar evento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Evento actualizado' } } },
            delete: { tags: ['Eventos'], summary: 'Eliminar evento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Evento eliminado' } } }
        },
        '/reportes/create': { post: { tags: ['Reportes'], summary: 'Crear reporte', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Reporte creado' } } } },
        '/reportes/': { get: { tags: ['Reportes'], summary: 'Listar reportes', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Reportes listados' } } } },
        '/reportes/{id}': {
            get: { tags: ['Reportes'], summary: 'Obtener reporte por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reporte obtenido' } } },
            put: { tags: ['Reportes'], summary: 'Actualizar reporte', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reporte actualizado' } } },
            delete: { tags: ['Reportes'], summary: 'Eliminar reporte', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reporte eliminado' } } }
        },
        '/reportes/{id}/pdf': { get: { tags: ['Reportes'], summary: 'Descargar reporte PDF', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'PDF generado' } } } },
        '/Health': { get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'Servicio saludable' } } } }
    }
});

export const setupSwagger = (app) => {
    // Montamos la UI de Swagger y tambien el spec en JSON.
    const spec = createSpec();
    app.use(DOCS_PATH, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
    app.get(`${DOCS_PATH}.json`, (req, res) => res.json(spec));
};

