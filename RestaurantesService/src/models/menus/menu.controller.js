import Menu from './menu.model.js';
import Restaurante from '../restaurantes/restaurante.model.js';
import Plato from '../platos/plato.model.js';

const getRestauranteFromUser = async (usuario) => {
    if (!usuario || usuario.role !== 'ADMIN_RESTAURANT_ROLE') return null;
    if (usuario.restaurante) return usuario.restaurante;

    const restaurante = await Restaurante.findOne({ dueño: usuario.id }).select('_id').lean();
    return restaurante?._id || null;
};

const getRestaurantesFromUser = async (usuario) => {
    if (!usuario || usuario.role !== 'ADMIN_RESTAURANT_ROLE') return [];
    
    const userId = String(usuario.id || usuario._id || usuario.uid || "");
    const queryConditions = [];
    
    if (userId) {
        queryConditions.push({ dueño: userId });
    }
    if (usuario.restaurante) {
        queryConditions.push({ _id: usuario.restaurante });
    }
    
    if (queryConditions.length === 0) return [];
    
    const list = await Restaurante.find({ $or: queryConditions }).select('_id').lean();
    return list.map(r => r._id.toString());
};

export const createMenu = async (req, res) => {
    try {
        const menuData = { ...req.body };

        if (req.file && req.file.path) {
            menuData.fotoMenu = req.file.path;
        }

        // Normalizar isActive cuando viene de multipart/form-data como string
        if (typeof menuData.isActive === 'string') {
            menuData.isActive = menuData.isActive === 'true';
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado'
                });
            }
            if (menuData.restaurante) {
                const hasAccess = restauranteIds.includes(menuData.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para agregar menús a este restaurante'
                    });
                }
            } else {
                menuData.restaurante = restauranteIds[0];
            }
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
        const { page = 1, limit = 10, isActive } = req.query;
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);
        
        const filter = {};
        if (req.usuario.role === 'USER_ROLE') {
            filter.isActive = true;
        } else if (isActive !== undefined) {
            filter.isActive = isActive === true || isActive === 'true';
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes un restaurante asignado'
                });
            }
            if (req.query.restaurante) {
                const hasAccess = restauranteIds.includes(req.query.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver los menús de este restaurante'
                    });
                }
                filter.restaurante = req.query.restaurante;
            } else {
                filter.restaurante = { $in: restauranteIds };
            }
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
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !menu.restaurante || !restauranteIds.includes(menu.restaurante._id.toString())) {
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

        if (req.file && req.file.path) {
            menuData.fotoMenu = req.file.path;
        }

        // Normalizar isActive cuando viene de multipart/form-data como string
        if (typeof menuData.isActive === 'string') {
            menuData.isActive = menuData.isActive === 'true';
        }

        const menuExistente = await Menu.findById(id).select('restaurante');
        if (!menuExistente) {
            return res.status(404).json({
                success: false,
                message: 'Menu no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !restauranteIds.includes(menuExistente.restaurante.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes editar menus de tu restaurante'
                });
            }
            
            // Si intenta cambiar a otro restaurante, validamos que le pertenezca
            if (menuData.restaurante) {
                const hasAccess = restauranteIds.includes(menuData.restaurante.toString());
                if (!hasAccess) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para reasignar este menú a este restaurante'
                    });
                }
            } else {
                menuData.restaurante = menuExistente.restaurante.toString();
            }
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
            const restauranteIds = await getRestaurantesFromUser(req.usuario);
            if (!restauranteIds || restauranteIds.length === 0 || !restauranteIds.includes(menuExistente.restaurante.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes eliminar menus de tu restaurante'
                });
            }
        }

        const menuEliminado = await Menu.findByIdAndDelete(id);
        if (menuEliminado) {
            await Plato.deleteMany({ menu: id });
        }

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

