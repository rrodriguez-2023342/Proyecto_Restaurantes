import { Router } from 'express';
import { createMesa, getMesas } from './mesa.controller.js';

const router = Router();

router.post(
    '/create',
    createMesa
)

router.get(
    '/',
    getMesas
)

export default router;