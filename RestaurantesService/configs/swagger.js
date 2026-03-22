import swaggerUi from 'swagger-ui-express';

// Ruta base del microservicio y ruta donde se abre la documentacion.
const BASE_PATH = '/restaurantes/v1';
const DOCS_PATH = `${BASE_PATH}/docs`;

const createCrudOperations = (tag, entityName, baseSummary) => ({
    post: { tags: [tag], summary: `Crear ${baseSummary}`, responses: { '201': { description: `${entityName} creado` } } },
    get: { tags: [tag], summary: `Listar ${entityName}`, responses: { '200': { description: `${entityName} listados` } } }
});

// El spec esta escrito a mano para que sea mas facil entender
// que endpoints pertenecen a este microservicio.
const createSpec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'RestaurantesService API',
        version: '1.0.0',
        description: 'Documentacion del microservicio de restaurantes, mesas, menus, platos, inventarios y resenas.'
    },
    servers: [
        { url: `http://localhost:${process.env.PORT || 3007}${BASE_PATH}`, description: 'Local' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    },
    tags: [
        { name: 'Restaurantes' },
        { name: 'Mesas' },
        { name: 'Menus' },
        { name: 'Platos' },
        { name: 'Inventarios' },
        { name: 'Resenas' },
        { name: 'Health' }
    ],
    paths: {
        '/restaurantes/create': { post: { tags: ['Restaurantes'], summary: 'Crear restaurante', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Restaurante creado' } } } },
        '/restaurantes/': { get: { tags: ['Restaurantes'], summary: 'Listar restaurantes', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Restaurantes listados' } } } },
        '/restaurantes/{id}': {
            get: { tags: ['Restaurantes'], summary: 'Obtener restaurante por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Restaurante obtenido' } } },
            put: { tags: ['Restaurantes'], summary: 'Actualizar restaurante', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Restaurante actualizado' } } },
            delete: { tags: ['Restaurantes'], summary: 'Eliminar restaurante', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Restaurante eliminado' } } }
        },
        '/mesas/create': { post: { tags: ['Mesas'], summary: 'Crear mesa', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Mesa creada' } } } },
        '/mesas/': { get: { tags: ['Mesas'], summary: 'Listar mesas', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Mesas listadas' } } } },
        '/mesas/{id}': {
            get: { tags: ['Mesas'], summary: 'Obtener mesa por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Mesa obtenida' } } },
            put: { tags: ['Mesas'], summary: 'Actualizar mesa', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Mesa actualizada' } } },
            delete: { tags: ['Mesas'], summary: 'Eliminar mesa', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Mesa eliminada' } } }
        },
        '/menus/create': { post: { tags: ['Menus'], summary: 'Crear menu', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Menu creado' } } } },
        '/menus/': { get: { tags: ['Menus'], summary: 'Listar menus', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Menus listados' } } } },
        '/menus/{id}': {
            get: { tags: ['Menus'], summary: 'Obtener menu por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Menu obtenido' } } },
            put: { tags: ['Menus'], summary: 'Actualizar menu', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Menu actualizado' } } },
            delete: { tags: ['Menus'], summary: 'Eliminar menu', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Menu eliminado' } } }
        },
        '/platos/create': { post: { tags: ['Platos'], summary: 'Crear plato', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Plato creado' } } } },
        '/platos/': { get: { tags: ['Platos'], summary: 'Listar platos', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Platos listados' } } } },
        '/platos/{id}': {
            get: { tags: ['Platos'], summary: 'Obtener plato por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Plato obtenido' } } },
            put: { tags: ['Platos'], summary: 'Actualizar plato', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Plato actualizado' } } },
            delete: { tags: ['Platos'], summary: 'Eliminar plato', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Plato eliminado' } } }
        },
        '/inventarios/create': { post: { tags: ['Inventarios'], summary: 'Crear item de inventario', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Inventario creado' } } } },
        '/inventarios/': { get: { tags: ['Inventarios'], summary: 'Listar inventario', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Inventario listado' } } } },
        '/inventarios/{id}': {
            get: { tags: ['Inventarios'], summary: 'Obtener item de inventario por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Inventario obtenido' } } },
            put: { tags: ['Inventarios'], summary: 'Actualizar item de inventario', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Inventario actualizado' } } },
            delete: { tags: ['Inventarios'], summary: 'Eliminar item de inventario', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Inventario eliminado' } } }
        },
        '/resenas/create': { post: { tags: ['Resenas'], summary: 'Crear resena', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Resena creada' } } } },
        '/resenas/': { get: { tags: ['Resenas'], summary: 'Listar resenas', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Resenas listadas' } } } },
        '/resenas/{id}': {
            get: { tags: ['Resenas'], summary: 'Obtener resena por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Resena obtenida' } } },
            put: { tags: ['Resenas'], summary: 'Actualizar resena', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Resena actualizada' } } },
            delete: { tags: ['Resenas'], summary: 'Eliminar resena', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Resena eliminada' } } }
        },
        '/Health': { get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'Servicio saludable' } } } }
    }
});

export const setupSwagger = (app) => {
    // Aqui montamos tanto la UI como el JSON del spec.
    const spec = createSpec();
    app.use(DOCS_PATH, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
    app.get(`${DOCS_PATH}.json`, (req, res) => res.json(spec));
};

