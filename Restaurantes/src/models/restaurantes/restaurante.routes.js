import { Router } from 'express';

import { createRestaurante, getRestaurantes, getRestaurantesById, updateRestaurante, deleteRestaurante } from './restaurante.controller.js';
import { validateCreateRestaurante, validateViewRestaurante, validateUpdateRestaurante, validateDeleteRestaurante } from '../../../middlewares/restaurantes-validators.js';
import { uploadMenuImage } from '../../../middlewares/file-uploader.js';

const router = Router();

// Crear: Solo ADMIN_ROLE

router.post(
    '/create',
    uploadMenuImage.single('fotos'), // primero procesar la imagen y body
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
    uploadMenuImage.single('fotos'),
    validateUpdateRestaurante,
    updateRestaurante
);

// Eliminar
router.delete(
    '/:id',
    validateDeleteRestaurante,
    deleteRestaurante
)

export default router;
