import { Router } from 'express';
import { 
    createPlato, 
    getPlatos, 
    getPlatoById, 
    editarPlato, 
    eliminarPlato 
} from './plato.controller.js';
import { 
    validateCreatePlato, 
    validateUpdatePlato, 
    validateViewPlato,
    validateDeletePlato 
} from '../../../middlewares/platos-validators.js';

const router = Router();

// Crear: Solo ADMIN_ROLE y ADMIN_RESTAURANT_ROLE
router.post(
    '/create',
    validateCreatePlato,
    createPlato
);

// Obtener todos los platos: ADMINs y USER_ROLE (Clientes)
router.get(
    '/',
    validateViewPlato,
    getPlatos
);

// Obtener plato por ID: ADMINs y USER_ROLE (Clientes)
router.get(
    '/:id',
    validateViewPlato,
    getPlatoById
);

// Actualizar: Solo ADMIN_ROLE y ADMIN_RESTAURANT_ROLE
router.put(
    '/:id',
    validateUpdatePlato,
    editarPlato
);

// Eliminar (Soft Delete): Solo ADMIN_ROLE y ADMIN_RESTAURANT_ROLE
router.delete(
    '/:id',
    validateDeletePlato,
    eliminarPlato
);

export default router;