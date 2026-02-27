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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TIPO_LABEL = {
    VENTAS:           'Reporte de Ventas',
    RESERVACIONES:    'Reporte de Reservaciones',
    INVENTARIO:       'Reporte de Inventario',
    PLATOS_POPULARES: 'Reporte de Platos Populares',
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('es-GT') : '—';

const buildHtml = ({ name, tipoLabel, restaurante, reporte }) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

    <div style="background-color: #104523; padding: 24px; text-align: center;">
        <h1 style="color: #D2A52C; margin: 0; font-size: 22px;">${tipoLabel}</h1>
        <p  style="color: #ffffff; margin: 8px 0 0;">${restaurante}</p>
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

</div>`;

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Envía el PDF de un reporte por correo al usuario que lo generó.
 * @param {string} email        - Correo del destinatario
 * @param {string} name         - Nombre del destinatario
 * @param {Buffer} pdfBuffer    - Contenido del PDF
 * @param {Object} reporte      - Documento Mongoose del reporte
 */
export const sendReportePdfEmail = async (email, name, pdfBuffer, reporte) => {
    if (!transporter) {
        throw new Error('[email-service] Transportador SMTP no configurado');
    }

    const tipoLabel   = TIPO_LABEL[reporte.tipoReporte] ?? reporte.tipoReporte;
    const restaurante = reporte.restaurante?.nombre ?? 'Restaurante';
    const filename    = `reporte-${reporte.tipoReporte.toLowerCase()}-${reporte._id}.pdf`;

    await transporter.sendMail({
        from:    `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
        to:      email,
        subject: `${tipoLabel} - ${restaurante}`,
        html:    buildHtml({ name, tipoLabel, restaurante, reporte }),
        attachments: [
            { filename, content: pdfBuffer, contentType: 'application/pdf' },
        ],
    });
};