import { Router } from 'express';
import { createMenu, getMenus, getMenuById, editarMenu, eliminarMenu } from './menu.controller.js';
import { validateCreateMenu, validateUpdateMenu, validateDeleteMenu } from '../../../middlewares/menus-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateMenu,
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
    validateUpdateMenu,
    editarMenu
)

router.delete(
    '/:id',
    validateDeleteMenu,
    eliminarMenu
)

export default router;