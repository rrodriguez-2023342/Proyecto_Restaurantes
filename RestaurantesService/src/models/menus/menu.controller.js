import Menu from './menu.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Plato from '../platos/plato.model.js';

const getRestauranteFromUser = async (usuario) => {
    if (!usuario || usuario.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return usuario.restaurante;

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id || null;
};

export const createMenu = async (req, res) => {
    try {
        const menuData = { ...req.body };

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteFromUser(req.usuario);
            if (!restauranteId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado'
                });
            }
            menuData.restaurante = restauranteId;
        }

        const menu = new Menu(menuData);
        await menu.save();

        res.status(201).json({
            success: true,
            message: 'Menu creado exitosamente',
            data: menu
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el menu',
            error: error.message
        });
    }
};

export const getMenus = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);
        const filter = { isActive };

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteFromUser(req.usuario);
            if (!restauranteId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado'
                });
            }
            filter.restaurante = restauranteId;
        } else if (req.query.restaurante) {
            filter.restaurante = req.query.restaurante;
        }

        const [menus, total] = await Promise.all([
            Menu.find(filter)
                .limit(numericLimit)
                .skip((numericPage - 1) * numericLimit)
                .sort({ createdAt: -1 }),
            Menu.countDocuments(filter)
        ]);

        const menuIds = menus.map((menu) => menu._id);
        const platos = await Plato.find({
            menu: { $in: menuIds },
            disponible: true
        })
            .select('menu nombrePlato descripcionPlato precio tipoPlato')
            .sort({ createdAt: -1 });

        const platosByMenu = new Map();
        for (const plato of platos) {
            const menuId = plato.menu.toString();
            if (!platosByMenu.has(menuId)) {
                platosByMenu.set(menuId, []);
            }
            platosByMenu.get(menuId).push(plato);
        }

        const menusWithPlatos = menus.map((menu) => {
            const menuObj = menu.toObject();
            menuObj.platos = platosByMenu.get(menu._id.toString()) || [];
            return menuObj;
        });

        res.status(200).json({
            success: true,
            data: menusWithPlatos,
            pagination: {
                currentPage: numericPage,
                totalPages: Math.ceil(total / numericLimit),
                totalItems: total,
                limit: numericLimit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los menus',
            error: error.message
        });
    }
};

export const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findById(id).populate('restaurante');

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteFromUser(req.usuario);
            if (!restauranteId || menu.restaurante?._id?.toString() !== restauranteId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este menu'
                });
            }
        }

        const platos = await Plato.find({
            menu: menu._id,
            disponible: true
        })
            .select('nombrePlato descripcionPlato precio tipoPlato')
            .sort({ createdAt: -1 });

        const menuWithPlatos = menu.toObject();
        menuWithPlatos.platos = platos;

        res.status(200).json({
            success: true,
            message: 'Menu obtenido exitosamente',
            data: menuWithPlatos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el menu',
            error: error.message
        });
    }
};

export const editarMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menuData = { ...req.body };

        const menuExistente = await Menu.findById(id).select('restaurante');
        if (!menuExistente) {
            return res.status(404).json({
                success: false,
                message: 'Menu no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteFromUser(req.usuario);
            if (!restauranteId || menuExistente.restaurante.toString() !== restauranteId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes editar menus de tu restaurante'
                });
            }
            menuData.restaurante = restauranteId;
        }

        const menuEditado = await Menu.findByIdAndUpdate(
            id,
            menuData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Menu editado exitosamente',
            data: menuEditado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el menu',
            error: error.message
        });
    }
};

export const eliminarMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const menuExistente = await Menu.findById(id).select('restaurante');
        if (!menuExistente) {
            return res.status(404).json({
                success: false,
                message: 'Menu no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteId = await getRestauranteFromUser(req.usuario);
            if (!restauranteId || menuExistente.restaurante.toString() !== restauranteId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes eliminar menus de tu restaurante'
                });
            }
        }

        const menuEliminado = await Menu.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Menu eliminado exitosamente',
            data: menuEliminado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el menu',
            error: error.message
        });
    }
};
