import Evento from './evento.model.js';

export const createEvento = async (req, res) => {
    try {
        const eventoData = req.body;

        const evento = new Evento(eventoData);
        await evento.save();

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: evento
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el evento',
            error: error.message
        })
    }
}

export const getEventos = async (req, res) => {
    try {
        const { page = 1, limit = 10} = req.query;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const eventos = await Evento.find({})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort();

        const total = await Evento.countDocuments();

        res.status(200).json({
            success: true,
            data: eventos,
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
            message: 'Error al obtener los eventos',
            error: error.message
        })
    }
}

export const getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findById(id)
            .populate('restaurante');
            
        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: evento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el evento',
            error: error.message
        });
    }
};

export const updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const eventoData = req.body;
        
        const evento = await Evento.findByIdAndUpdate(
            id,
            eventoData,
            { new: true, runValidators: true }
        );

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: evento
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el evento',
            error: error.message
        });
    }
}

export const deleteEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findByIdAndDelete(id);

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el evento',
            error: error.message
        });
    }
}