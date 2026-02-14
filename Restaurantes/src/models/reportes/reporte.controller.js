import Reporte from './reporte.model.js';

export const createReporte = async (req, res) => {
    try {
        const reporteData = req.body;

        const reporte = new Reporte(reporteData);
        await reporte.save();

        res.status(201).json({
            success: true,
            message: 'Reporte creado exitosamente',
            data: reporte
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el reporte',
            error: error.message
        })
    }
}

export const getReportes = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const reportes = await Reporte.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Reporte.countDocuments();


        res.status(200).json({
            success: true,
            data: reportes,
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
            message: 'Error al obtener los reportes',
            error: error.message
        })
    }
}


export const getReporteById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const reporte = await Reporte.findById(id).populate('restaurante');

        if (!reporte) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Reporte obtenido exitosamente',
            data: reporte
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte',
            error: error.message
        });
    }
}

export const updateReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const reporteData = req.body;

        const reporteEditado = await Reporte.findByIdAndUpdate(
            id,
            reporteData,
            { new: true, runValidators: true }
        )

        if (!reporteEditado) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reporte editado exitosamente',
            data: reporteEditado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar el reporte',
            error: error.message
        });
    }
}

export const deleteReporte = async (req, res) => {
    try {
        const { id } = req.params;

        const reporteEliminado = await Reporte.findByIdAndDelete(id);

        if (!reporteEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reporte eliminado correctamente',
            data: reporteEliminado
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el reporte',
            error: error.message
        });
    }
};