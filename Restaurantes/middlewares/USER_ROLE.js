'use strict';

export const USER_ROLE = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado',
            error: 'UNAUTHORIZED',
        });
    }

    if (req.user.role !== 'USER_ROLE') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso',
            error: 'FORBIDDEN',
            requiredRole: 'USER_ROLE',
            yourRole: req.user.role,
        });
    }

    next();
};
