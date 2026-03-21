import nodemailer from 'nodemailer';

// Transporter 
const createTransporter = () => {
    const { SMTP_USERNAME, SMTP_PASSWORD } = process.env;
    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
        console.warn('[email-service] Credenciales SMTP no configuradas. El envÃ­o de correos no funcionarÃ¡.');
        return null;
    }
    return nodemailer.createTransport({
        host:    process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port:    parseInt(process.env.SMTP_PORT ?? '587'),
        secure:  false,
        auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
        connectionTimeout: 10_000,
        greetingTimeout:   10_000,
        socketTimeout:     10_000,
        tls: { rejectUnauthorized: false },
    });
};

const TIPO_LABEL = {
    VENTAS:           'Reporte de Ventas',
    RESERVACIONES:    'Reporte de Reservaciones',
    INVENTARIO:       'Reporte de Inventario',
    PLATOS_POPULARES: 'Reporte de Platos Populares',
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('es-GT') : 'â€”';
const fmtTime  = (d) => d ? new Date(d).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : 'â€”';
const fmtMoney = (n) => `Q ${Number(n ?? 0).toFixed(2)}`;

const supportBlock = `
<div style="margin-top: 20px; padding: 16px; background-color: #E6F4E9; border-left: 4px solid #104523; border-radius: 4px;">
    <p style="margin: 0 0 6px; font-weight: bold; color: #104523; font-size: 13px;">Â¿Tuviste algÃºn problema?</p>
    <p style="margin: 0 0 8px; color: #555; font-size: 13px;">ComunÃ­cate con nuestro equipo de soporte:</p>
    <p style="margin: 0 0 4px; color: #333; font-size: 13px;">
        @ <a href="mailto:restaurantein6bm@gmail.com" style="color: #104523; text-decoration: none;">restaurantein6bm@gmail.com</a>
    </p>
    <p style="margin: 0; color: #333; font-size: 13px;">
        Tel. <a href="tel:+50211110000" style="color: #104523; text-decoration: none;">+502 1111-0000</a>
    </p>
</div>`;

const tableRow = (label, value, zebra = false) => `
<tr ${zebra ? 'style="background-color: #E6F4E9;"' : ''}>
    <td style="padding: 8px 12px; font-weight: bold; color: #104523;">${label}</td>
    <td style="padding: 8px 12px;">${value}</td>
</tr>`;

const table = (rows) => `
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    ${rows}
</table>`;

const baseLayout = (headerTitle, headerSub, bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #104523; padding: 24px; text-align: center;">
        <h1 style="color: #D2A52C; margin: 0; font-size: 22px;">${headerTitle}</h1>
        ${headerSub ? `<p style="color: #ffffff; margin: 8px 0 0; font-size: 14px;">${headerSub}</p>` : ''}
    </div>
    <div style="padding: 24px; background-color: #f9f9f9;">
        ${bodyContent}
        <p style="color: #666; font-size: 13px; margin-top: 16px;">
            Este es un correo automÃ¡tico, por favor no respondas a este mensaje.
        </p>
        ${supportBlock}
    </div>
    <div style="background-color: #104523; padding: 12px; text-align: center;">
        <p style="color: #D2A52C; margin: 0; font-size: 12px;">
            Documento generado electrÃ³nicamente. No requiere firma ni sello.
        </p>
    </div>
</div>
</body>
</html>`;

// HTML Builders 

// Reporte
const buildReporteHtml = ({ name, tipoLabel, restaurante, reporte }) =>
    baseLayout(tipoLabel, restaurante, `
        <p>Estimado <strong>${name}</strong>,</p>
        <p>Tu reporte ha sido generado exitosamente. EncontrarÃ¡s el PDF adjunto a este correo.</p>
        ${table(
            tableRow('Restaurante', restaurante, true) +
            tableRow('Tipo de reporte', tipoLabel) +
            tableRow('Periodo', `${fmtDate(reporte.fechaInicio)} â€” ${fmtDate(reporte.fechaFin)}`, true) +
            tableRow('Generado el', fmtDate(reporte.createdAt))
        )}
    `);

// Factura
const buildFacturaHtml = ({ name, factura, pedido, restaurante }) =>
    baseLayout('Factura', `${restaurante} Â· No. ${factura._id.toString().slice(-8).toUpperCase()}`, `
        <p>Estimado <strong>${name}</strong>,</p>
        <p>Tu factura ha sido generada exitosamente. EncontrarÃ¡s el PDF adjunto a este correo.</p>
        ${table(
            tableRow('No. Factura', factura._id.toString().slice(-8).toUpperCase(), true) +
            tableRow('Restaurante', restaurante) +
            tableRow('Tipo de pedido', pedido?.tipoPedido ?? 'â€”', true) +
            tableRow('Fecha', fmtDate(factura.createdAt)) +
            tableRow('Subtotal', fmtMoney(factura.subtotal), true) +
            tableRow('Propina', fmtMoney(factura.propina)) +
            `<tr style="background-color: #104523;">
                <td style="padding: 10px 12px; font-weight: bold; color: #D2A52C; font-size: 15px;">TOTAL</td>
                <td style="padding: 10px 12px; font-weight: bold; color: #ffffff; font-size: 15px;">${fmtMoney(factura.total)}</td>
            </tr>`
        )}
    `);

// ReservaciÃ³n
const RESERVACION_TITULO = {
    creada:     'âœ“ ReservaciÃ³n Creada',
    actualizada:'â—´ ReservaciÃ³n Actualizada',
    cancelada:  'âœ• ReservaciÃ³n Cancelada',
};

const RESERVACION_MSG = {
    creada:     'Tu reservaciÃ³n ha sido creada exitosamente.',
    actualizada:'Tu reservaciÃ³n ha sido actualizada.',
    cancelada:  'Tu reservaciÃ³n ha sido cancelada.',
};

const buildReservacionHtml = ({ name, accion, reservacion, restaurante }) =>
    baseLayout(RESERVACION_TITULO[accion] ?? 'ReservaciÃ³n', restaurante, `
        <p>Estimado <strong>${name}</strong>,</p>
        <p>${RESERVACION_MSG[accion] ?? ''}</p>
        ${table(
            tableRow('Restaurante', restaurante, true) +
            tableRow('Fecha', fmtDate(reservacion.fecha)) +
            tableRow('Hora', fmtTime(reservacion.fecha), true) +
            tableRow('Personas', reservacion.cantidadPersonas ?? 'â€”') +
            tableRow('Estado', reservacion.estado ?? 'â€”', true)
        )}
    `);

// Pedido
const PEDIDO_TITULO = {
    creado:     'âœ“ Pedido Recibido',
    actualizado:'â—´ Estado de tu Pedido',
    eliminado:  'âœ• Pedido Eliminado',
};

const PEDIDO_ESTADO_MSG = {
    'Pendiente':          'Tu pedido estÃ¡ pendiente de confirmaciÃ³n.',
    'En preparaciÃ³n':     'Tu pedido estÃ¡ siendo preparado, Â¡ya casi estÃ¡ listo!',
    'Listo para entrega': 'Tu pedido estÃ¡ listo para entrega.',
    'Entregado':          'Tu pedido ha sido entregado. Â¡Buen provecho!',
    'Cancelado':          'Tu pedido ha sido cancelado.',
};

const buildPedidoHtml = ({ name, accion, pedido, restaurante }) =>
    baseLayout(PEDIDO_TITULO[accion] ?? 'Pedido', restaurante, `
        <p>Estimado <strong>${name}</strong>,</p>
        <p>${accion === 'creado' ? 'Tu pedido ha sido recibido exitosamente.' : (PEDIDO_ESTADO_MSG[pedido.estadoPedido] ?? 'Tu pedido ha sido actualizado.')}</p>
        ${table(
            tableRow('Restaurante', restaurante, true) +
            tableRow('Tipo de pedido', pedido.tipoPedido ?? 'â€”') +
            tableRow('Estado', pedido.estadoPedido ?? 'â€”', true) +
            tableRow('Total', fmtMoney(pedido.totalPedido)) +
            tableRow('Fecha', fmtDate(pedido.createdAt), true)
        )}
    `);

// Evento
const EVENTO_TITULO = {
    creado:     'âœ“ Nuevo Evento Agendado',
    actualizado:'â—´ Evento Actualizado',
    eliminado:  'âœ• Evento Eliminado',
};

const EVENTO_MSG = {
    creado:     (r) => `Se ha agendado un nuevo evento en ${r}.`,
    actualizado:()  => `La informaciÃ³n del evento ha sido actualizada.`,
    eliminado:  ()  => `El evento ha sido eliminado.`,
};

const buildEventoHtml = ({ name, accion, evento, restaurante }) =>
    baseLayout(EVENTO_TITULO[accion] ?? 'Evento', restaurante, `
        <p>Estimado <strong>${name}</strong>,</p>
        <p>${(EVENTO_MSG[accion] ?? (() => ''))(restaurante)}</p>
        ${table(
            tableRow('Restaurante', restaurante, true) +
            tableRow('Evento', evento.titulo ?? 'â€”') +
            (evento.descripcion ? tableRow('DescripciÃ³n', evento.descripcion, true) : '') +
            tableRow('Fecha del evento', fmtDate(evento.fechaEvento), !evento.descripcion) +
            tableRow('Hora', fmtTime(evento.fechaEvento), !!evento.descripcion)
        )}
    `);

// EnvÃ­o base

const sendMail = async ({ to, subject, html, attachments }) => {
    const transporter = createTransporter();
    if (!transporter) throw new Error('[email-service] Transportador SMTP no configurado');
    await transporter.sendMail({
        from:     `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        encoding: 'utf-8',
        ...(attachments ? { attachments } : {}),
    });
};

// Exports 

export const sendReportePdfEmail = async (email, name, pdfBuffer, reporte) => {
    const tipoLabel   = TIPO_LABEL[reporte.tipoReporte] ?? reporte.tipoReporte;
    const restaurante = reporte.restaurante?.nombre ?? 'Restaurante';
    const filename    = `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte._id}.pdf`;
    await sendMail({
        to:      email,
        subject: `${tipoLabel} - ${restaurante}`,
        html:    buildReporteHtml({ name, tipoLabel, restaurante, reporte }),
        attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
    });
};

export const sendFacturaPdfEmail = async (email, name, pdfBuffer, factura, pedido) => {
    const restaurante = pedido?.restaurante?.nombre ?? 'Restaurante';
    const filename    = `factura-${factura._id.toString().slice(-8).toUpperCase()}.pdf`;
    await sendMail({
        to:      email,
        subject: `Factura ${factura._id.toString().slice(-8).toUpperCase()} - ${restaurante}`,
        html:    buildFacturaHtml({ name, factura, pedido, restaurante }),
        attachments: [{ filename, content: pdfBuffer, contentType: 'application/pdf' }],
    });
};

export const sendReservacionEmail = async (email, name, accion, reservacion, restaurante) => {
    await sendMail({
        to:      email,
        subject: `${RESERVACION_TITULO[accion] ?? 'ReservaciÃ³n'} - ${restaurante}`,
        html:    buildReservacionHtml({ name, accion, reservacion, restaurante }),
    });
};

export const sendPedidoEmail = async (email, name, accion, pedido, restaurante) => {
    await sendMail({
        to:      email,
        subject: `${PEDIDO_TITULO[accion] ?? 'Pedido'} - ${restaurante}`,
        html:    buildPedidoHtml({ name, accion, pedido, restaurante }),
    });
};

export const sendEventoEmail = async (email, name, accion, evento, restaurante) => {
    await sendMail({
        to:      email,
        subject: `${EVENTO_TITULO[accion] ?? 'Evento'} - ${restaurante}`,
        html:    buildEventoHtml({ name, accion, evento, restaurante }),
    });
};
