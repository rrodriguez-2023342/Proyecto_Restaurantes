import Reservacion from '../models/reservaciones/reservacion.model.js';
import Mesa from '../models/mesas/mesa.model.js';

//funcion para mostar las mesas disponibles para una fecha y de que restaurante hablamos
//importamos lo necesario que seria el id de mesa, restaurante, fecha, la cantidad de personas 
export const validarMesaParaReservacion = async ({ mesaId, restauranteId, fecha, cantidadPersonas }) => {
    // convertimos nuestra fecha ingresada por un tipo Date en js
    const fechaReservacion = new Date(fecha);

    //validamos que nuestra fecha sea valida y si es invalidad retornamos un Nan y tira el 400
    //ejemplo del nana si en la fecha ponemos un xd nos devuelve el nan pero si ponemos la fecha nos retorna un numero
    // este nan solo nos dice que no es un numero valido
    if (Number.isNaN(fechaReservacion.getTime())) {
        return {
            ok: false,
            status: 400,
            payload: {
                success: false,
                message: 'La fecha de reservación no es válida'
            }
        };
    }

    //mandamos a buscar el id de la mesa , la capacidad deesa mesa y a que restaurante pertenece
    //decimos que mesas va a ser igual a nuestro modelo de Mesa de Mongoose y que este encuentra por el id de la mesa y trae los objetos que 
    // dejamos establecidos dentro del select
    const mesa = await Mesa.findById(mesaId).select('_id numeroMesa capacidad restaurante');
    //y si la mesa no existe solo retornamos el 404 de que no se encuentra ese id de mesa
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

    // decimos que si la cantidad de personas es mayor a la capacidad de la mesa entonces tenemos que retornar 
    // un mensaje que diga la mesa x tiene x capacidad de personas
    if (cantidadPersonas > mesa.capacidad) {
        return {
            ok: false,
            status: 400,
            payload: {
                success: false,
                message: `La mesa ${mesa.numeroMesa} tiene capacidad máxima de ${mesa.capacidad} personas`
            }
        };
    }

    // en si creamos un rango del dia para poder validar que mesa esta ocupada o no en ese dia 
    // inicia desde las 0 hasta las 23 
    const inicioDia = new Date(fechaReservacion);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaReservacion);
    finDia.setHours(23, 59, 59, 999);

    //Buscamos si la mesa ya esta ocupada ese mismo dia
    const mesaOcupada = await Reservacion.findOne({
        //busca la reservacion que tenga el mismo id de mesa
        mesa: mesaId,
        //miramos si la fecha esta entre el inicio o en el final de lisa
        fecha: { $gte: inicioDia, $lte: finDia },
        //y buscamos que el estado no es te cancelada porque ahi no aplica nada xd
        estado: { $ne: 'CANCELADA' }
    });


    // si encontro una mesa reservada ese dia
    if (mesaOcupada) {
        //buscamos las reservacions del restaurante que tengan la fecha entre el inicio y
        //  el final del dia y que no esten canceladas y que sean distintas a la mesa ocupada
        const mesasOcupadasEnFecha = await Reservacion.find({
            restaurante: restauranteId,
            fecha: { $gte: inicioDia, $lte: finDia },
            estado: { $ne: 'CANCELADA' }
        }).distinct('mesa');

        //encontramos las mesas libres
        const mesasLibres = await Mesa.find({
            //confirmamos que el restaurante sea el mismo
            restaurante: restauranteId,
            //que de los numeros de id no esten en las mesas ocupadas
            _id: { $nin: mesasOcupadasEnFecha },
            // y debe marcar que estan disponibles
            disponibilidad: true
        })
        //solo trae los campos necesarios como el id numero de mesa y su capacidad
            .select('_id numeroMesa capacidad')
            .sort({ numeroMesa: 1 });

            // solo retornamos que la mesa ya esta ocupada 
        return {
            ok: false,
            status: 409,
            payload: {
                success: false,
                message: `La mesa ${mesa.numeroMesa} ya está ocupada para esa fecha`,
                //y devolvemos que mesas son las que si estan libres
                mesasLibres
            }
        };
    }

    return {
        ok: true
    };
};
