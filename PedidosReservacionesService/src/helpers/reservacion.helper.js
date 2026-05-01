import Reservacion from '../models/reservaciones/reservacion.model.js';
import Mesa from '../models/mesas/mesa.model.js';
import Restaurante from '../models/restaurantes/restaurante.model.js';

const TIME_ZONE = 'America/Guatemala';
const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const displayDayNames = {
    domingo: 'Domingo',
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miercoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sabado'
};

const normalizeDay = (day = '') =>
    day
        .replace(/\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a1|\u00c3\u0192\u00c2\u00a1|\u00c3\u00a1|\u00e1/g, 'a')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const timeToMinutes = (time = '00:00') => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const getReservationParts = (date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).formatToParts(date);

    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const weekdayIndex = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    }[values.weekday];

    return {
        dayName: dayNames[weekdayIndex],
        hour: Number(values.hour),
        minute: Number(values.minute)
    };
};

export const validarMesaParaReservacion = async ({
    mesaId,
    restauranteId,
    fecha,
    cantidadPersonas,
    reservacionId = null
}) => {
    const fechaReservacion = new Date(fecha);

    if (Number.isNaN(fechaReservacion.getTime())) {
        return {
            ok: false,
            status: 400,
            payload: {
                success: false,
                message: 'La fecha de reservacion no es valida'
            }
        };
    }

    const restaurante = await Restaurante.findById(restauranteId).select('horario');
    if (!restaurante) {
        return {
            ok: false,
            status: 404,
            payload: {
                success: false,
                message: 'El restaurante indicado no existe'
            }
        };
    }

    const horario = restaurante.horario;
    if (horario) {
        const partesReservacion = getReservationParts(fechaReservacion);
        const diaReservacion = normalizeDay(partesReservacion.dayName);
        const diasAbierto = new Set((horario.diasAbierto || []).map(normalizeDay));

        if (diasAbierto.size > 0 && !diasAbierto.has(diaReservacion)) {
            return {
                ok: false,
                status: 400,
                payload: {
                    success: false,
                    message: `El restaurante no atiende los ${displayDayNames[diaReservacion] || partesReservacion.dayName}`
                }
            };
        }

        const minutosReservacion = partesReservacion.hour * 60 + partesReservacion.minute;
        const minutosApertura = timeToMinutes(horario.apertura);
        const minutosCierre = timeToMinutes(horario.cierre);

        if (minutosReservacion < minutosApertura || minutosReservacion >= minutosCierre) {
            return {
                ok: false,
                status: 400,
                payload: {
                    success: false,
                    message: `El restaurante atiende de ${horario.apertura} a ${horario.cierre}`
                }
            };
        }
    }

    const mesa = await Mesa.findById(mesaId).select('_id numeroMesa capacidad restaurante');
    if (!mesa) {
        return {
            ok: false,
            status: 404,
            payload: {
                success: false,
                message: 'La mesa indicada no existe'
            }
        };
    }

    if (mesa.restaurante.toString() !== restauranteId.toString()) {
        return {
            ok: false,
            status: 400,
            payload: {
                success: false,
                message: 'La mesa seleccionada no pertenece a este restaurante'
            }
        };
    }

    if (cantidadPersonas > mesa.capacidad) {
        return {
            ok: false,
            status: 400,
            payload: {
                success: false,
                message: `La mesa ${mesa.numeroMesa} tiene capacidad maxima de ${mesa.capacidad} personas`
            }
        };
    }

    const inicioHorario = new Date(fechaReservacion);
    inicioHorario.setSeconds(0, 0);
    const finHorario = new Date(inicioHorario);
    finHorario.setMinutes(finHorario.getMinutes() + 1);

    const queryMesaOcupada = {
        mesa: mesaId,
        fecha: { $gte: inicioHorario, $lt: finHorario },
        estado: { $ne: 'CANCELADA' }
    };

    if (reservacionId) {
        queryMesaOcupada._id = { $ne: reservacionId };
    }

    const mesaOcupada = await Reservacion.findOne(queryMesaOcupada);

    if (mesaOcupada) {
        const mesasOcupadasEnFecha = await Reservacion.find({
            restaurante: restauranteId,
            fecha: { $gte: inicioHorario, $lt: finHorario },
            estado: { $ne: 'CANCELADA' }
        }).distinct('mesa');

        const mesasLibres = await Mesa.find({
            restaurante: restauranteId,
            _id: { $nin: mesasOcupadasEnFecha },
            disponibilidad: true
        })
            .select('_id numeroMesa capacidad')
            .sort({ numeroMesa: 1 });

        return {
            ok: false,
            status: 409,
            payload: {
                success: false,
                message: `Ya existe una reservacion para la mesa ${mesa.numeroMesa} en esa fecha y hora`,
                mesasLibres
            }
        };
    }

    return { ok: true };
};
