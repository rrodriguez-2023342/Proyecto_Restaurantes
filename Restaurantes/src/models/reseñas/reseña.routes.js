import { Router } from 'express';
import { 
    createReseña, 
    getReseñas, 
    updateReseña, 
    deleteReseña,
    getReseñaById 
} from './reseña.controller.js';
import { 
    validateCreateResenia, 
    validateUpdateResenia, 
    validateViewResenia,
    validateDeleteResenia 
} from '../../../middlewares/resenias-validators.js';

const router = Router();

// Crear reseña
router.post(
    '/create',
    validateCreateResenia,
    createReseña
);

// Obtener todas las reseñas
router.get(
    '/',
    validateViewResenia,
    getReseñas
);

// Obtener reseña por ID
router.get(
    '/:id',
    validateViewResenia,
    getReseñaById
);

// Actualizar reseña
router.put(
    '/:id',
    validateUpdateResenia,
    updateReseña
);

// Eliminar o Ocultar reseña
router.delete(
    '/:id',
    validateDeleteResenia,
    deleteReseña
);

export default router;