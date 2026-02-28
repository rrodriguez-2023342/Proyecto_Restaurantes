import { Router } from 'express';
import { createMenu, getMenus, getMenuById, editarMenu, eliminarMenu } from './menu.controller.js';
import { validateCreateMenu, validateUpdateMenu, validateDeleteMenu, validateViewMenu } from '../../../middlewares/menus-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateMenu,
    createMenu
)

router.get(
    '/',
    validateViewMenu,
    getMenus
)

router.get(
    '/:id',
    validateViewMenu,
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
