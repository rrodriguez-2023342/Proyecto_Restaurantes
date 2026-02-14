import { Router } from 'express';
import { createReseña, getReseñas, updateReseña, deleteReseña, getReseñaById } from './reseña.controller.js';

const router = Router();

router.post(
    '/create',
    createReseña
)

router.get(
    '/',
    getReseñas
)

router.put(
    '/:id',
    updateReseña
)

router.delete(
    '/:id',
    deleteReseña
)
router.get(
    '/:id',
    getReseñaById
)


export default router;