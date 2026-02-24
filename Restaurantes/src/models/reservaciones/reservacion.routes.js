import { Router } from 'express';
import { 
    createReservacion, 
    getReservaciones, 
    updateReservacion, 
    deleteReservacion, 
    getReservacionById 
} from './reservacion.controller.js';
import { 
    validateCreateReservacion, 
    validateUpdateReservacion, 
    validateViewReservaciones, 
    validateDeleteReservacion 
} from '../../../middlewares/reservaciones-validators.js';

const router = Router();

// Crear reservación: Todos los roles
router.post(
    '/create',
    validateCreateReservacion,
    createReservacion
);

// Obtener todas las reservaciones
router.get(
    '/',
    validateViewReservaciones,
    getReservaciones
);

// Obtener reservación por ID
router.get(
    '/:id',
    validateViewReservaciones,
    getReservacionById
);

// Actualizar reservación
router.put(
    '/:id',
    validateUpdateReservacion,
    updateReservacion
);

// Cancelar reservación
router.delete(
    '/:id',
    validateDeleteReservacion,
    deleteReservacion
);

router.put(
    '/:id',
    updateReservacion
)

router.delete(
    '/:id',
    deleteReservacion
)
router.get(
    '/:id',
    getReservacionById
)

export default router;