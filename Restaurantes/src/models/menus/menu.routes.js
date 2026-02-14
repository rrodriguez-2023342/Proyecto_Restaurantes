import { Router } from 'express';
import { createMenu, getMenus } from './menu.controller.js';

const router = Router();

router.post(
    '/create',
    createMenu
)

router.get(
    '/',
    getMenus
)

export default router;