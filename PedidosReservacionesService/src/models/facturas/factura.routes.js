import { Router } from 'express';
import {
    createFactura,
    getFacturas,
    getFacturaById,
    updateFactura,
    deleteFactura,
    descargarFacturaPdf
} from './factura.controller.js';
import {
    validateCreateFactura,
    validateUpdateFactura,
    validateDeleteFactura,
    validateDescargarFacturaPdf
} from '../../../middlewares/facturas-validators.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireRoles } from '../../../middlewares/validate-role.js';

const router = Router();

router.post('/',         validateCreateFactura,                                          createFactura);
router.get('/',          validateJWT, requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), getFacturas);
router.get('/:id',       validateJWT, requireRoles('ADMIN_ROLE', 'ADMIN_RESTAURANT_ROLE'), getFacturaById);
router.put('/:id',       validateUpdateFactura,                                          updateFactura);
router.delete('/:id',    validateDeleteFactura,                                          deleteFactura);
router.get('/:id/pdf',   validateDescargarFacturaPdf,                                    descargarFacturaPdf);

export default router;