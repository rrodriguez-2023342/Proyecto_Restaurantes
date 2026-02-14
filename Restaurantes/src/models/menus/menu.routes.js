import { Router } from 'express';
import { createMenu, getMenus, getMenuById, editarMenu, eliminarMenu } from './menu.controller.js';

const router = Router();

router.post(
    '/create',
    createMenu
)

router.get(
    '/',
    getMenus
)

router.get(
    '/:id',
    getMenuById
)

router.put(
    '/:id',
    editarMenu
)

router.delete(
    '/:id',
    eliminarMenu
)

export default router;