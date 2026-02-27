import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────

const createTransporter = () => {
    const { SMTP_USERNAME, SMTP_PASSWORD } = process.env;

    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
        console.warn('[email-service] Credenciales SMTP no configuradas. El envío de correos no funcionará.');
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

const transporter = createTransporter();

// ─── Helpers compartidos ──────────────────────────────────────────────────────

const TIPO_LABEL = {
    VENTAS:           'Reporte de Ventas',
    RESERVACIONES:    'Reporte de Reservaciones',
    INVENTARIO:       'Reporte de Inventario',
    PLATOS_POPULARES: 'Reporte de Platos Populares',
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-GT') : '—';

const fmtMoney = (n) =>
    `Q ${Number(n ?? 0).toFixed(2)}`;

// ─── HTML builders ────────────────────────────────────────────────────────────

const buildReporteHtml = ({ name, tipoLabel, restaurante, reporte }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

    <div style="background-color: #104523; padding: 24px; text-align: center;">
        <h1 style="color: #D2A52C; margin: 0; font-size: 22px;">${tipoLabel}</h1>
        <p style="color: #ffffff; margin: 8px 0 0;">${restaurante}</p>
    </div>

    <div style="padding: 24px; background-color: #f9f9f9;">
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu reporte ha sido generado exitosamente. Encontrarás el PDF adjunto a este correo.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background-color: #E6F4E9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Restaurante</td>
                <td style="padding: 8px 12px;">${restaurante}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Tipo de reporte</td>
                <td style="padding: 8px 12px;">${tipoLabel}</td>
            </tr>
            <tr style="background-color: #E6F4E9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Periodo</td>
                <td style="padding: 8px 12px;">
                    ${fmtDate(reporte.fechaInicio)} — ${fmtDate(reporte.fechaFin)}
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Generado el</td>
                <td style="padding: 8px 12px;">${fmtDate(reporte.createdAt)}</td>
            </tr>
        </table>

        <p style="color: #666; font-size: 13px;">
            Este es un correo automático, por favor no respondas a este mensaje.
        </p>
    </div>

    <div style="background-color: #104523; padding: 12px; text-align: center;">
        <p style="color: #D2A52C; margin: 0; font-size: 12px;">
            Documento generado electrónicamente. No requiere firma ni sello.
        </p>
    </div>

</div>
</body>
</html>`;

const buildFacturaHtml = ({ name, factura, pedido, restaurante }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

    <div style="background-color: #104523; padding: 24px; text-align: center;">
        <h1 style="color: #D2A52C; margin: 0; font-size: 22px;">Factura</h1>
        <p style="color: #ffffff; margin: 8px 0 0;">${restaurante}</p>
        <p style="color: #a8d5b5; margin: 4px 0 0; font-size: 13px;">
            No. ${factura._id.toString().slice(-8).toUpperCase()}
        </p>
    </div>

    <div style="padding: 24px; background-color: #f9f9f9;">
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu factura ha sido generada exitosamente. Encontrarás el PDF adjunto a este correo.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background-color: #E6F4E9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">No. Factura</td>
                <td style="padding: 8px 12px;">${factura._id.toString().slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Restaurante</td>
                <td style="padding: 8px 12px;">${restaurante}</td>
            </tr>
            <tr style="background-color: #E6F4E9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Tipo de pedido</td>
                <td style="padding: 8px 12px;">${pedido?.tipoPedido ?? '—'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Fecha</td>
                <td style="padding: 8px 12px;">${fmtDate(factura.createdAt)}</td>
            </tr>
            <tr style="background-color: #E6F4E9;">
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Subtotal</td>
                <td style="padding: 8px 12px;">${fmtMoney(factura.subtotal)}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #104523;">Impuesto</td>
                <td style="padding: 8px 12px;">${fmtMoney(factura.impuesto)}</td>
            </tr>
            <tr style="background-color: #104523;">
                <td style="padding: 10px 12px; font-weight: bold; color: #D2A52C; font-size: 15px;">TOTAL</td>
                <td style="padding: 10px 12px; font-weight: bold; color: #ffffff; font-size: 15px;">${fmtMoney(factura.total)}</td>
            </tr>
        </table>

        <p style="color: #666; font-size: 13px;">
            Este es un correo automático, por favor no respondas a este mensaje.
        </p>
    </div>

    <div style="background-color: #104523; padding: 12px; text-align: center;">
        <p style="color: #D2A52C; margin: 0; font-size: 12px;">
            Documento generado electrónicamente. No requiere firma ni sello.
        </p>
    </div>

</div>
</body>
</html>`;

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Envía el PDF de un reporte por correo al usuario que lo generó.
 */
export const sendReportePdfEmail = async (email, name, pdfBuffer, reporte) => {
    if (!transporter) {
        throw new Error('[email-service] Transportador SMTP no configurado');
    }

    const tipoLabel   = TIPO_LABEL[reporte.tipoReporte] ?? reporte.tipoReporte;
    const restaurante = reporte.restaurante?.nombre ?? 'Restaurante';
    const filename    = `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte._id}.pdf`;

    await transporter.sendMail({
        from:     `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to:       email,
        subject:  `${tipoLabel} - ${restaurante}`,
        html:     buildReporteHtml({ name, tipoLabel, restaurante, reporte }),
        encoding: 'utf-8',
        attachments: [
            { filename, content: pdfBuffer, contentType: 'application/pdf' },
        ],
    });
};

/**
 * Envía el PDF de una factura por correo.
 * @param {string} email     - Correo del destinatario
 * @param {string} name      - Nombre del destinatario
 * @param {Buffer} pdfBuffer - Contenido del PDF
 * @param {Object} factura   - Documento Mongoose de la factura
 * @param {Object} pedido    - Documento Mongoose del pedido (populado con restaurante)
 */
export const sendFacturaPdfEmail = async (email, name, pdfBuffer, factura, pedido) => {
    if (!transporter) {
        throw new Error('[email-service] Transportador SMTP no configurado');
    }

    const restaurante = pedido?.restaurante?.nombre ?? 'Restaurante';
    const filename    = `factura-${factura._id.toString().slice(-8).toUpperCase()}.pdf`;

    await transporter.sendMail({
        from:     `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to:       email,
        subject:  `Factura ${factura._id.toString().slice(-8).toUpperCase()} - ${restaurante}`,
        html:     buildFacturaHtml({ name, factura, pedido, restaurante }),
        encoding: 'utf-8',
        attachments: [
            { filename, content: pdfBuffer, contentType: 'application/pdf' },
        ],
    });
};