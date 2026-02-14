import { Router } from 'express';
import { createRestaurante, getRestaurantes, getRestauranteById, updateRestaurante, deleteRestaurante } from './restaurante.controller.js';

const router = Router();

router.post(
    '/create',
    createRestaurante
)

router.get(
    '/',
    getRestaurantes
)
router.put(
    '/:id',
    updateRestaurante
)

router.delete(
    '/:id',
    deleteRestaurante
)
router.get(
    '/:id',
    getRestauranteById
)

export default router;