import { Router } from 'express';
import { createMesa, getMesas, getMesaById, editarMesa, eliminarMesa } from './mesa.controller.js';

const router = Router();

router.post(
    '/create',
    createMesa
)

router.get(
    '/',
    getMesas
)

router.get(
    '/:id',
    getMesaById
)

router.put(
    '/:id',
    editarMesa
)

router.delete(
    '/:id',
    eliminarMesa
)

export default router;