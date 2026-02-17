import { Router } from 'express';
import { 
    createRestaurante, 
    getRestaurantes, 
    getRestaurantesById, 
    updateRestaurante, 
    deleteRestaurante 
} from './restaurante.controller.js';
import { 
    validateCreateRestaurante, 
    validateUpdateRestaurante, 
    validateViewRestaurante, 
    validateDeleteRestaurante 
} from '../../../middlewares/restaurantes-validators.js';

const router = Router();

// Crear: Solo ADMIN_ROLE
router.post(
    '/create',
    validateCreateRestaurante,
    createRestaurante
);

// Obtener todos
router.get(
    '/',
    validateViewRestaurante,
    getRestaurantes
);

// Obtener por ID
router.get(
    '/:id',
    validateViewRestaurante,
    getRestaurantesById
);

// Actualizar
router.put(
    '/:id',
    validateUpdateRestaurante,
    updateRestaurante
);

// Eliminar
router.delete(
    '/:id',
    validateDeleteRestaurante,
    deleteRestaurante
);

export default router;