import Restaurante from './restaurante.model.js';

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
        const { page = 1, limit = 10 } = req.query;
        let filter = { status: true };

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            filter._id = req.usuario.restaurante;
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

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE' && id !== req.usuario.restaurante.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para ver otros restaurantes' });
        }

        const restaurante = await Restaurante.findById(id);
        if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });

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

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE' && id !== req.usuario.restaurante.toString()) {
            return res.status(403).json({ message: 'Solo puedes actualizar tu propio restaurante' });
        }

        const restauranteEditado = await Restaurante.findByIdAndUpdate(id, req.body, { new: true });
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

        res.status(200).json({
            success: true,
            message: 'Restaurante eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};