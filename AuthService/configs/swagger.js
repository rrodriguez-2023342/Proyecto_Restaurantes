import swaggerUi from 'swagger-ui-express';

// Ruta base del servicio y ruta final donde se abre Swagger.
const BASE_PATH = '/api/v1';
const DOCS_PATH = `${BASE_PATH}/docs`;

// Aqui se construye el documento OpenAPI de forma manual.
// Lo hice asi para que quede mas ordenado y facil de editar.
const createSpec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'AuthService API',
        version: '1.0.0',
        description: 'Documentacion del microservicio de autenticacion, usuarios y roles.'
    },
    servers: [
        { url: `http://localhost:${process.env.PORT || 3006}${BASE_PATH}`, description: 'Local' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Message: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                }
            }
        }
    },
    tags: [
        { name: 'Auth', description: 'Autenticacion y perfil' },
        { name: 'Users', description: 'Administracion de usuarios y roles' },
        { name: 'Health', description: 'Estado del servicio' }
    ],
    paths: {
        '/auth/register': { post: { tags: ['Auth'], summary: 'Registrar usuario', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object' } } } }, responses: { '201': { description: 'Usuario registrado' } } } },
        '/auth/login': { post: { tags: ['Auth'], summary: 'Iniciar sesion', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Login exitoso' } } } },
        '/auth/verify-email': { post: { tags: ['Auth'], summary: 'Verificar correo', responses: { '200': { description: 'Correo verificado' } } } },
        '/auth/resend-verification': { post: { tags: ['Auth'], summary: 'Reenviar verificacion', responses: { '200': { description: 'Correo reenviado' } } } },
        '/auth/forgot-password': { post: { tags: ['Auth'], summary: 'Solicitar recuperacion de contrasena', responses: { '200': { description: 'Solicitud procesada' } } } },
        '/auth/reset-password': { post: { tags: ['Auth'], summary: 'Restablecer contrasena', responses: { '200': { description: 'Contrasena actualizada' } } } },
        '/auth/profile': {
            get: { tags: ['Auth'], summary: 'Obtener perfil autenticado', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Perfil obtenido' } } },
            put: { tags: ['Auth'], summary: 'Actualizar perfil', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Perfil actualizado' } } }
        },
        '/auth/profile/by-id': { post: { tags: ['Auth'], summary: 'Obtener perfil por id', responses: { '200': { description: 'Perfil obtenido' } } } },
        '/auth/logout': { post: { tags: ['Auth'], summary: 'Cerrar sesion', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Sesion cerrada' } } } },
        '/auth/change-password': { put: { tags: ['Auth'], summary: 'Cambiar contrasena', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Contrasena cambiada' } } } },
        '/auth/profile/image': { put: { tags: ['Auth'], summary: 'Cambiar imagen de perfil', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Imagen actualizada' } } } },
        '/auth/profile/username': { put: { tags: ['Auth'], summary: 'Solicitar cambio de username', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Solicitud creada' } } } },
        '/auth/profile/username/confirm': { post: { tags: ['Auth'], summary: 'Confirmar cambio de username', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Username actualizado' } } } },
        '/auth/profile/phone': { put: { tags: ['Auth'], summary: 'Solicitar cambio de telefono', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Solicitud creada' } } } },
        '/auth/profile/phone/confirm': { post: { tags: ['Auth'], summary: 'Confirmar cambio de telefono', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Telefono actualizado' } } } },
        '/auth/deactivate': { post: { tags: ['Auth'], summary: 'Solicitar desactivacion', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Solicitud creada' } } } },
        '/auth/deactivate/confirm': { post: { tags: ['Auth'], summary: 'Confirmar desactivacion', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Cuenta desactivada' } } } },
        '/auth/activate': { post: { tags: ['Auth'], summary: 'Solicitar activacion', responses: { '200': { description: 'Solicitud creada' } } } },
        '/auth/activate/confirm': { post: { tags: ['Auth'], summary: 'Confirmar activacion', responses: { '200': { description: 'Cuenta activada' } } } },
        '/users': {
            get: { tags: ['Users'], summary: 'Listar usuarios', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Usuarios listados' } } },
            post: { tags: ['Users'], summary: 'Crear usuario', security: [{ bearerAuth: [] }], responses: { '201': { description: 'Usuario creado' } } }
        },
        '/users/{userId}': {
            get: { tags: ['Users'], summary: 'Obtener usuario por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Usuario obtenido' } } },
            put: { tags: ['Users'], summary: 'Actualizar usuario', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Usuario actualizado' } } },
            delete: { tags: ['Users'], summary: 'Eliminar usuario', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Usuario eliminado' } } }
        },
        '/users/{userId}/role': { put: { tags: ['Users'], summary: 'Asignar rol principal', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Rol actualizado' } } } },
        '/users/{userId}/roles': { get: { tags: ['Users'], summary: 'Obtener roles de usuario', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Roles obtenidos' } } } },
        '/users/by-role/{roleName}': { get: { tags: ['Users'], summary: 'Listar usuarios por rol', security: [{ bearerAuth: [] }], parameters: [{ name: 'roleName', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Usuarios obtenidos' } } } },
        '/users/deactivate/{userId}': { patch: { tags: ['Users'], summary: 'Desactivar usuario por admin', security: [{ bearerAuth: [] }], parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Usuario desactivado' } } } },
        '/health': { get: { tags: ['Health'], summary: 'Health check', responses: { '200': { description: 'Servicio saludable' } } } }
    }
});

export const setupSwagger = (app) => {
    // Este metodo monta la interfaz visual y tambien el JSON del spec.
    const spec = createSpec();
    app.use(DOCS_PATH, swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
    app.get(`${DOCS_PATH}.json`, (req, res) => res.json(spec));
};

