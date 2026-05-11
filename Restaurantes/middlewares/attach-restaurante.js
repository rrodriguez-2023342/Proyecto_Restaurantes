'use strict';

import Restaurante from '../src/models/restaurantes/restaurante.model.js';

// Middleware que determina el restaurante asociado al usuario cuando
// tiene rol ADMIN_RESTAURANT_ROLE. Busca en la colección Restaurantes
// un documento cuyo campo "dueño" coincida con el id del usuario.
// Si lo encuentra, anexa _id en req.usuario.restaurante para que el
// resto de la aplicación pueda filtrar fácilmente.

export const attachRestaurant = async (req, res, next) => {
    try {
        if (
            req.usuario &&
            (req.usuario.role === 'ADMIN_RESTAURANT_ROLE' || req.usuario.role === 'ADMIN_ROLE') &&
            !req.usuario.restaurante
        ) {
            const userId = req.usuario.id;
            let restaurante = await Restaurante.findOne({ dueño: String(userId) }).lean();
            
            if (!restaurante && !isNaN(Number(userId))) {
                restaurante = await Restaurante.findOne({ dueño: Number(userId) }).lean();
            }

            if (restaurante) {
                req.usuario.restaurante = restaurante._id;
            }
        }
    } catch (error) {
        // no bloquear petición si falla la consulta; sólo deja sin restaurante
        console.error('[attachRestaurant] error querying restaurante:', error.message);
    }
    next();
};
