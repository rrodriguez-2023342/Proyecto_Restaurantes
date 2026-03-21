import Mesa from './mesa.model.js';

// Auxiliar para detectar error de duplicado de MongoDB
const isDuplicateKeyError = (error) => error.code === 11000;

//CREAR MESA
export const createMesa = async (req, res) => {
    try {
        const data = req.body;

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            data.restaurante = req.usuario.restaurante;
        }

        const mesa = new Mesa(data);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            mesa
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una mesa con el número ${req.body.numeroMesa} en este restaurante`
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

//OBTENER TODAS LAS MESAS
export const getMesas = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = { disponibilidad: true };

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            query.restaurante = req.usuario.restaurante;
        }

        const [mesas, total] = await Promise.all([
            Mesa.find(query)
                .populate('restaurante', 'nombre')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ numeroMesa: 1 }),
            Mesa.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message
        });
    }
};

//OBTENER MESA POR ID
export const getMesaById = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findById(id).populate('restaurante', 'nombre');

        if (!mesa || !mesa.disponibilidad) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada o inactiva'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!mesa.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({ success: false, message: 'Acceso denegado a esta mesa' });
            }
            if (mesa.restaurante._id.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({ success: false, message: 'Acceso denegado a esta mesa' });
            }
        }

        res.status(200).json({ success: true, mesa });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la mesa',
            error: error.message
        });
    }
};

//EDITAR MESA
export const editarMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const mesaExistente = await Mesa.findById(id);
        if (!mesaExistente) return res.status(404).json({ message: 'Mesa no encontrada' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!mesaExistente.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({ message: 'No tienes permiso para editar esta mesa' });
            }
            if (mesaExistente.restaurante.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para editar esta mesa' });
            }
            data.restaurante = req.usuario.restaurante;
        }

        const mesaEditada = await Mesa.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            mesa: mesaEditada
        });
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return res.status(400).json({
                success: false,
                message: `Ya existe una mesa con el número ${req.body.numeroMesa} en este restaurante`
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la mesa',
            error: error.message
        });
    }
};

//ELIMINAR MESA (Soft Delete)
export const eliminarMesa = async (req, res) => {
    try {
        const { id } = req.params;

        const mesa = await Mesa.findById(id);
        if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!mesa.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({ message: 'No tienes permiso para eliminar esta mesa' });
            }
            if (mesa.restaurante.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para eliminar esta mesa' });
            }
        }

        await Mesa.findByIdAndUpdate(id, { disponibilidad: false });

        res.status(200).json({
            success: true,
            message: 'Mesa eliminada (desactivada) exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la mesa',
            error: error.message
        });
    }
};