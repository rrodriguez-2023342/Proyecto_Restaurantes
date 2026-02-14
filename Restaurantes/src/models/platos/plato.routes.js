import { Router } from 'express';
import { createPlato, getPlatos } from './plato.controller.js';

const router = Router();

router.post(
    '/create',
    createPlato
)

router.get(
    '/',
    getPlatos
)

export default router;