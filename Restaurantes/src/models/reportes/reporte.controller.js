import Reporte from './reporte.model.js';


//GENERAR REPORTE
//Regla: Los admins pueden crear reportes. 
//Si es Admin de Restaurante, se fuerza su restauranteId.

export const createReporte = async (req, res) => {
    try {
        const data = req.body;

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            data.restaurante = req.usuario.restaurante;
        }

        const reporte = new Reporte(data);
        await reporte.save();

        res.status(201).json({
            success: true,
            message: 'Reporte generado exitosamente',
            data: reporte
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

//OBTENER REPORTES
//Regla: El Admin de restaurante solo ve sus propios reportes.

export const getReportes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let query = {};

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE') {
            query.restaurante = req.usuario.restaurante;
        }

        const [reportes, total] = await Promise.all([
            Reporte.find(query)
                .populate('restaurante', 'nombre')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 }),
            Reporte.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: reportes,
            pagination: {
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los reportes',
            error: error.message
        });
    }
};

//OBTENER REPORTE POR ID

export const getReporteById = async (req, res) => {
    try {
        const { id } = req.params;
        const reporte = await Reporte.findById(id).populate('restaurante');

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE' && 
            reporte.restaurante._id.toString() !== req.usuario.restaurante.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver este reporte'
            });
        }

        res.status(200).json({
            success: true,
            data: reporte
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el reporte',
            error: error.message
        });
    }
};

//EDITAR REPORTE

export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const reporteExistente = await Reporte.findById(id);

        if (!reporteExistente) return res.status(404).json({ message: 'Reporte no encontrado' });

        if (req.usuario.role === 'ADMIN_RESTAURANT_ROLE' && 
            reporteExistente.restaurante.toString() !== req.usuario.restaurante.toString()) {
            return res.status(403).json({ message: 'No tienes permiso para editar este reporte' });
        }

        const reporteEditado = await Reporte.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({
            success: true,
            message: 'Reporte actualizado',
            data: reporteEditado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el reporte',
            error: error.message
        });
    }
};

// NOTA: La función deleteReporte ha sido eliminada por orden del Scrum Master (X en la tabla).