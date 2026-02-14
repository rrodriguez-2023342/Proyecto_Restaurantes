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