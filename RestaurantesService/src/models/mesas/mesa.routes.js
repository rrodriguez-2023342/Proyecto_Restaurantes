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
    validateDeleteMesa,
    validateViewMesa,
    validateListMesas
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
    validateListMesas,
    getMesas
);

// Obtener una mesa específica por ID
router.get(
    '/:id',
    validateViewMesa,
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