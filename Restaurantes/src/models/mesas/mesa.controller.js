import Mesa from './mesa.model.js';


//CREAR MESA
//Regla: ADMIN_ROLE puede crear en cualquier restaurante. 
//ADMIN_RESTAURANT_ROLE solo en el suyo.

export const createMesa = async (req, res) => {
    try {
        const data = req.body;

        // Si es Admin de Restaurante, se forza que la mesa se asigne a SU restaurante
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
        res.status(400).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

//OBTENER TODAS LAS MESAS
//Regla: El Admin de restaurante solo ve mesas de su restaurante.

export const getMesas = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = { disponibilidad: true }; // Solo mostrar mesas activas

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

//Obtener mesa
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

        // Validar que el Admin de Restaurante no vea mesas ajenas
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!mesa.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado a esta mesa'
                });
            }
            if (mesa.restaurante._id.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado a esta mesa'
                });
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

//Editar Mesa
export const editarMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const mesaExistente = await Mesa.findById(id);
        if (!mesaExistente) return res.status(404).json({ message: 'Mesa no encontrada' });

        // control de permisos sobre la mesa
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            if (!mesaExistente.restaurante || !req.usuario.restaurante) {
                return res.status(403).json({ message: 'No tienes permiso para editar esta mesa' });
            }
            if (mesaExistente.restaurante.toString() !== req.usuario.restaurante.toString()) {
                return res.status(403).json({ message: 'No tienes permiso para editar esta mesa' });
            }
        }

        // Si el usuario es ADMIN_RESTAURANT_ROLE, forzamos que la mesa siga perteneciendo a su restaurante
        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            data.restaurante = req.usuario.restaurante;
        }

        const mesaEditada = await Mesa.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            mesa: mesaEditada
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la mesa',
            error: error.message
        });
    }
};

//Eliminar Mesa
//Regla: Se cambia disponibilidad a false en lugar de borrar el registro.
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