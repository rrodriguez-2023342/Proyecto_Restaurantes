import Menu from './menu.model.js';

export const createMenu = async (req, res) => {
    try {
        const menuData = req.body;

        const menu = new Menu(menuData);
        await menu.save();

        res.status(201).json({
            success: true,
            message: 'Menú creado exitosamente',
            data: menu
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el menú',
            error: error.message
        })
    }
}

export const getMenus = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true} = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const menus = await Menu.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Menu.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: menus,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los menús',
            error: error.message
        })
    }
}

export const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        const menu = await Menu.findById(id).populate('restaurante');

        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Menú obtenido exitosamente',
            data: menu
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el menú',
            error: error.message
        });
    }
}

export const editarMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menuData = req.body;

        const menuEditado = await Menu.findByIdAndUpdate(
            id,
            menuData,
            { new: true, runValidators: true }
        )

        if (!menuEditado) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menú editado exitosamente',
            data: menuEditado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el menú',
            error: error.message
        });
    }
}

export const eliminarMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const menuEliminado = await Menu.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        )

        if (!menuEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Menú no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menú eliminado exitosamente',
            data: menuEliminado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el menú',
            error: error.message
        });
    }
}