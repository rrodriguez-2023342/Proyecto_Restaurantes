import { Router } from 'express';
import { createReseña, getReseñas } from './reseña.controller.js';

const router = Router();

router.post(
    '/create',
    createReseña
)

router.get(
    '/',
    getReseñas
)

export default router;