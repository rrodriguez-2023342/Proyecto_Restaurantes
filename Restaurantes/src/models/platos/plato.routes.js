import { Router } from 'express';
import { createPlato, getPlatos, getPlatoById, editarPlato, eliminarPlato } from './plato.controller.js';

const router = Router();

router.post(
    '/create',
    createPlato
)

router.get(
    '/',
    getPlatos
)

router.get(
    '/:id',
    getPlatoById
)

router.put(
    '/:id',
    editarPlato
)

router.delete(
    '/:id',
    eliminarPlato
)
export default router;