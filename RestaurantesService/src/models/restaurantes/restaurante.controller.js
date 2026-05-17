import Restaurante from './restaurante.model.js';
import Menu from '../menus/menu.model.js';
import Plato from '../platos/plato.model.js';
import Mesa from '../mesas/mesa.model.js';
import Inventario from '../inventario/inventario.model.js';
import Reseña from '../reseñas/reseña.model.js';

//CREAR RESTAURANTE
//Regla: Solo ADMIN_ROLE puede crear.

export const createRestaurante = async (req, res) => {
    try {
        const restauranteData = req.body;
        // Si se subió una imagen, guardar la URL en fotos
        if (req.file && req.file.path) {
            restauranteData.fotos = req.file.path;
        }
        const restaurante = new Restaurante(restauranteData);
        await restaurante.save();

        res.status(201).json({
            success: true,
            message: 'Restaurante creado exitosamente',
            data: restaurante
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el restaurante',
            error: error.message
        });
    }
}

//OBTENER RESTAURANTES
// Regla: ADMIN_RESTAURANT_ROLE solo ve el suyo.

export const getRestaurantes = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;
        let filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        } else if (req.usuario.role === 'USER_ROLE') {
            filter.isActive = true;
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const userId = String(req.usuario.id || req.usuario._id || req.usuario.uid || "");
            let queryConditions = [];
            
            if (userId) {
                queryConditions.push({ dueño: userId });
            }
            if (req.usuario.restaurante) {
                queryConditions.push({ _id: req.usuario.restaurante });
            }

            if (queryConditions.length > 0) {
                filter = { ...filter, $or: queryConditions };
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado'
                });
            }
        }

        const [restaurantes, total] = await Promise.all([
            Restaurante.find(filter)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Restaurante.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            data: restaurantes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

//OBTENER POR ID

export const getRestaurantesById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurante = await Restaurante.findById(id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const userId = String(req.usuario.id || req.usuario._id || req.usuario.uid || "");
            const isOwner = String(restaurante.dueño) === userId;
            const isAssigned = req.usuario.restaurante && id === req.usuario.restaurante.toString();

            if (!isOwner && !isAssigned) {
                return res.status(403).json({ message: 'No tienes permiso para ver otros restaurantes' });
            }
        }

        res.status(200).json({ success: true, data: restaurante });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

//ACTUALIZAR RESTAURANTE
//Regla: ADMIN_RESTAURANT_ROLE solo el suyo.

export const updateRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const OWNER_FIELD = 'due\u00F1o';
        const rawBody = req.body || {};
        const restauranteData = Object.entries(rawBody).reduce((acc, [key, value]) => {
            if (!key.startsWith('direccion.')) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const existingRestaurante = await Restaurante.findById(id);
        if (!existingRestaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const userId = String(req.usuario.id || req.usuario._id || req.usuario.uid || "");
            const isOwner = String(existingRestaurante.dueño) === userId;
            const isAssigned = req.usuario.restaurante && id === req.usuario.restaurante.toString();

            if (!isOwner && !isAssigned) {
                return res.status(403).json({ message: 'Solo puedes actualizar tu propio restaurante' });
            }
        }
        const direccionFields = {
            calle: rawBody['direccion.calle'],
            ciudad: rawBody['direccion.ciudad'],
            zona: rawBody['direccion.zona'],
            departamento: rawBody['direccion.departamento'],
            pais: rawBody['direccion.pais'],
            referencia: rawBody['direccion.referencia'],
        };
        const hasDireccionUpdate = Object.values(direccionFields).some(
            (value) => value !== undefined
        );

        if (hasDireccionUpdate) {
            const direccion = Object.fromEntries(
                Object.entries(direccionFields).filter(([, value]) => value !== undefined)
            );
            if (!direccion.pais) direccion.pais = 'Guatemala';
            restauranteData.direccion = direccion;
        }

        if (
            req.usuario.role !== 'ADMIN_ROLE' &&
            Object.prototype.hasOwnProperty.call(restauranteData, OWNER_FIELD)
        ) {
            return res.status(403).json({ message: 'Solo ADMIN_ROLE puede reasignar el dueno' });
        }

        if (req.file && req.file.path) {
            restauranteData.fotos = req.file.path;
        }

        const restauranteEditado = await Restaurante.findByIdAndUpdate(id, restauranteData, { new: true });
        if (!restauranteEditado) return res.status(404).json({ message: 'Restaurante no encontrado' });

        res.status(200).json({
            success: true,
            message: 'Restaurante editado exitosamente',
            data: restauranteEditado
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

//ELIMINAR RESTAURANTE
//Regla: Solo ADMIN_ROLE (Físico o Lógico según prefieras)

export const deleteRestaurante = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario.role !== 'ADMIN_ROLE') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar restaurantes' });
        }

        const restauranteEliminado = await Restaurante.findByIdAndDelete(id);
        if (!restauranteEliminado) return res.status(404).json({ message: 'Restaurante no encontrado' });

        // Borrar menús y platos asociados
        const menus = await Menu.find({ restaurante: id }).select('_id');
        const menuIds = menus.map(m => m._id);

        if (menuIds.length > 0) {
            await Plato.deleteMany({ menu: { $in: menuIds } });
        }
        await Menu.deleteMany({ restaurante: id });

        // Borrar mesas, inventario y reseñas
        await Mesa.deleteMany({ restaurante: id });
        await Inventario.deleteMany({ restaurante: id });
        await Reseña.deleteMany({ restaurante: id });

        res.status(200).json({
            success: true,
            message: 'Restaurante y todo su contenido relacionado (menús, platos, mesas, inventario y reseñas) eliminados correctamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
