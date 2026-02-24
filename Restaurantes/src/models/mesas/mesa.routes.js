import { Router } from 'express';
import { 
    createMesa, 
    getMesas, 
    getMesaById, 
    editarMesa, 
    eliminarMesa 
} from './mesa.controller.js';
import { 
    validateCreateMesa, 
    validateUpdateMesa, 
    validateDeleteMesa 
} from '../../../middlewares/mesas-validators.js';

const router = Router();

// Crear una nueva mesa
router.post(
    '/create',
    validateCreateMesa,
    createMesa
);

// Obtener todas las mesas
router.get(
    '/',
    validateDeleteMesa,
    getMesas
);

// Obtener una mesa específica por ID
router.get(
    '/:id',
    validateDeleteMesa,
    getMesaById
);

// Actualizar datos de una mesa
router.put(
    '/:id',
    validateUpdateMesa,
    editarMesa
);

// Eliminar una mesa (Soft Delete)
router.delete(
    '/:id',
    validateDeleteMesa,
    eliminarMesa
);

export default router;