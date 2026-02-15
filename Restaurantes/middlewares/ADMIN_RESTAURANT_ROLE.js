'use strict';

export const ADMIN_RESTAURANT_ROLE = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado',
            error: 'UNAUTHORIZED',
        });
    }

    if (req.user.role !== 'ADMIN_RESTAURANT_ROLE') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso',
            error: 'FORBIDDEN',
            requiredRole: 'ADMIN_RESTAURANT_ROLE',
            yourRole: req.user.role,
        });
    }

    next();
};
