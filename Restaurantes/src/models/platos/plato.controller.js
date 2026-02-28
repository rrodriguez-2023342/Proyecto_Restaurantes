import Plato from './plato.model.js';
import Menu from '../menus/menu.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';

const getRestauranteFromUser = async (usuario) => {
    if (!usuario || usuario.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return usuario.restaurante;

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id || null;
};

const validateMenuOwnership = async (menuId, usuario) => {
    if (usuario.role !== 'ADMIN_RESTAURANT_ROLE') return { valid: true };

    const restauranteId = await getRestauranteFromUser(usuario);
    if (!restauranteId) {
        return { valid: false, status: 403, message: 'No tienes un restaurante asignado' };
    }

    const menu = await Menu.findById(menuId).select('restaurante').lean();
    if (!menu) {
        return { valid: false, status: 404, message: 'Menu no encontrado' };
    }

    if (menu.restaurante.toString() !== restauranteId.toString()) {
        return { valid: false, status: 403, message: 'Solo puedes operar platos de menus de tu restaurante' };
    }

    return { valid: true, restauranteId };
};

export const createPlato = async (req, res) => {
    try {
        const platoData = { ...req.body };

        const ownership = await validateMenuOwnership(platoData.menu, req.usuario);
        if (!ownership.valid) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        if (req.file && req.file.path) {
            platoData.fotosPlato = req.file.path;
        }

        const plato = new Plato(platoData);
        await plato.save();

        res.status(201).json({
            success: true,
            message: 'Plato creado exitosamente',
            data: plato
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el plato',
            error: error.message
        });
    }
};

export const getPlatos = async (req, res) => {
    try {
        const { menu, page = 1, limit = 10 } = req.query;
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);
        const filter = { disponible: true, menu };

        const ownership = await validateMenuOwnership(menu, req.usuario);
        if (!ownership.valid) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        const [platos, total] = await Promise.all([
            Plato.find(filter)
                .populate('menu', 'nombreMenu')
                .limit(numericLimit)
                .skip((numericPage - 1) * numericLimit)
                .sort({ createdAt: -1 }),
            Plato.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: platos,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / numericLimit),
                currentPage: numericPage,
                limit: numericLimit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los platos',
            error: error.message
        });
    }
};

export const getPlatoById = async (req, res) => {
    try {
        const { id } = req.params;
        const plato = await Plato.findById(id).populate('menu');

        if (!plato || !plato.disponible) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado o no disponible'
            });
        }

        const ownership = await validateMenuOwnership(plato.menu._id, req.usuario);
        if (!ownership.valid && req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        res.status(200).json({
            success: true,
            data: plato
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el plato',
            error: error.message
        });
    }
};

export const editarPlato = async (req, res) => {
    try {
        const { id } = req.params;
        const platoData = { ...req.body };

        const platoExistente = await Plato.findById(id).populate('menu', 'restaurante');
        if (!platoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });
        }

        const ownershipActual = await validateMenuOwnership(platoExistente.menu._id, req.usuario);
        if (!ownershipActual.valid) {
            return res.status(ownershipActual.status).json({
                success: false,
                message: ownershipActual.message
            });
        }

        if (platoData.menu) {
            const ownershipNuevoMenu = await validateMenuOwnership(platoData.menu, req.usuario);
            if (!ownershipNuevoMenu.valid) {
                return res.status(ownershipNuevoMenu.status).json({
                    success: false,
                    message: ownershipNuevoMenu.message
                });
            }
        }

        const platoUpdated = await Plato.findByIdAndUpdate(
            id,
            platoData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Plato actualizado correctamente',
            data: platoUpdated
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el plato',
            error: error.message
        });
    }
};

export const eliminarPlato = async (req, res) => {
    try {
        const { id } = req.params;

        const platoExistente = await Plato.findById(id).populate('menu', 'restaurante');
        if (!platoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Plato no encontrado'
            });
        }

        const ownership = await validateMenuOwnership(platoExistente.menu._id, req.usuario);
        if (!ownership.valid) {
            return res.status(ownership.status).json({
                success: false,
                message: ownership.message
            });
        }

        await Plato.findByIdAndUpdate(
            id,
            { disponible: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Plato desactivado (eliminado) correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el plato',
            error: error.message
        });
    }
};
