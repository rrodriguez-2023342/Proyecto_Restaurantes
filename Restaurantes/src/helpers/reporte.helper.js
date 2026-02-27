// ─── PDF primitives ──────────────────────────────────────────────────────────
const normalizeText = (text) =>
    String(text)
        .replace(/á/g, 'a').replace(/Á/g, 'A')
        .replace(/é/g, 'e').replace(/É/g, 'E')
        .replace(/í/g, 'i').replace(/Í/g, 'I')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ú/g, 'u').replace(/Ú/g, 'U')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
        .replace(/¿/g, '?').replace(/¡/g, '!');

const escapePdfText = (text) =>
    String(text)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');

const PAGE_W    = 612;
const PAGE_H    = 792;
const MARGIN_X  = 48;
const MARGIN_Y  = 52;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const RIGHT_X   = MARGIN_X + CONTENT_W;
const CHAR_W    = 0.52;

const approxWidth = (text, fs) => String(text).length * fs * CHAR_W;
const centerX     = (text, fs) => MARGIN_X + (CONTENT_W - approxWidth(text, fs)) / 2;
const rightX      = (text, fs) => RIGHT_X - approxWidth(text, fs);

const opText = (x, y, font, size, text) =>
    `BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${escapePdfText(text)}) Tj ET`;

const opColorText = (x, y, font, size, text, r, g, b) => [
    `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
    opText(x, y, font, size, text),
    `0 0 0 rg`,
];

const opRect = (x, y, w, h, r, g, b) => [
    `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`,
    `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`,
    `0 0 0 rg`,
];

const opLine = (x1, y1, x2, y2, width = 0.5, r = 0.78, g = 0.78, b = 0.78) => [
    `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`,
    `${width} w`,
    `${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`,
    `0 0 0 RG`,
];

// ─── Paleta de colores ───────────────────────────────────────────────────────

const GREEN_D = [0.063, 0.275, 0.133];  // #104523
const GREEN_M = [0.118, 0.467, 0.235];  // #1E773C
const GREEN_L = [0.902, 0.957, 0.914];  // #E6F4E9
const GOLD    = [0.824, 0.647, 0.173];  // #D2A52C
const GREY_L  = [0.965, 0.965, 0.965];
const WHITE   = [1, 1, 1];

// ─── Constantes de dominio ───────────────────────────────────────────────────

const TIPO_LABEL = {
    VENTAS:           'Reporte de Ventas',
    RESERVACIONES:    'Reporte de Reservaciones',
    INVENTARIO:       'Reporte de Inventario',
    PLATOS_POPULARES: 'Reporte de Platos Populares',
};

// ─── Motor de paginación ─────────────────────────────────────────────────────

/**
 * Convierte un array de comandos de alto nivel en páginas con operaciones PDF.
 * Cada vez que el contenido no cabe, se crea una nueva página automáticamente.
 */
const buildPages = (commands) => {
    const pages = [];
    let ops = [];
    let y   = PAGE_H - MARGIN_Y;

    const flush = () => { pages.push({ ops }); ops = []; y = PAGE_H - MARGIN_Y; };
    const need  = (h) => { if (y - h < MARGIN_Y) flush(); };
    const drop  = (h) => { y -= h; };

    for (const cmd of commands) {
        switch (cmd.type) {

            case 'coverHeader': {
                const blockH = 90;
                need(blockH + 20);
                ops.push(...opRect(0, PAGE_H - MARGIN_Y - blockH, PAGE_W, blockH + MARGIN_Y, ...GREEN_D));
                ops.push(...opRect(0, PAGE_H - MARGIN_Y - blockH - 3, PAGE_W, 3, ...GOLD));
                ops.push(...opColorText(centerX(cmd.title, 20),       PAGE_H - MARGIN_Y - 36, 'F2', 20, cmd.title,       ...WHITE));
                ops.push(...opColorText(centerX(cmd.restaurante, 11), PAGE_H - MARGIN_Y - 60, 'F1', 11, cmd.restaurante, ...GOLD));
                ops.push(...opColorText(rightX(cmd.generadoPor, 8),   PAGE_H - MARGIN_Y - 80, 'F1',  8, cmd.generadoPor, 0.7, 0.9, 0.7));
                drop(blockH + 14);
                break;
            }

            case 'sectionHeader': {
                const h = 22;
                need(h + 6);
                drop(6);
                ops.push(...opRect(MARGIN_X - 4, y - h + 5, CONTENT_W + 8, h, ...GREEN_L));
                ops.push(...opRect(MARGIN_X - 4, y - h + 5, 3, h, ...GREEN_M));
                ops.push(...opColorText(MARGIN_X + 6, y - 10, 'F2', 8.5, cmd.text.toUpperCase(), ...GREEN_D));
                drop(h + 2);
                break;
            }

            case 'keyvalue': {
                const h = 16;
                need(h);
                if (cmd.zebra) ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREY_L));
                ops.push(opText(MARGIN_X + 4,           y - 2, 'F1', 8.5, cmd.key));
                ops.push(opText(rightX(cmd.value, 8.5), y - 2, 'F1', 8.5, cmd.value));
                drop(h);
                break;
            }

            case 'dataRow': {
                const h = 16;
                need(h);
                if (cmd.index % 2 === 0) ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREY_L));
                ops.push(opText(MARGIN_X + 4,           y - 2, 'F1', 8.5, cmd.key));
                ops.push(opText(rightX(cmd.value, 8.5), y - 2, 'F1', 8.5, String(cmd.value)));
                drop(h);
                break;
            }

            case 'totalRow': {
                const h = 20;
                need(h + 4);
                drop(4);
                ops.push(...opLine(MARGIN_X, y + 2, RIGHT_X, y + 2, 0.75, ...GREEN_M));
                ops.push(...opRect(MARGIN_X - 4, y - h + 6, CONTENT_W + 8, h, ...GREEN_L));
                ops.push(...opColorText(MARGIN_X + 4,         y - 3, 'F2', 9, cmd.key,   ...GREEN_D));
                ops.push(...opColorText(rightX(cmd.value, 9), y - 3, 'F2', 9, cmd.value, ...GREEN_D));
                drop(h + 2);
                break;
            }

            case 'text': {
                need(14);
                ops.push(...opColorText(MARGIN_X + 4, y - 2, 'F1', 7.5, cmd.text, 0.35, 0.35, 0.35));
                drop(14);
                break;
            }

            case 'footer': {
                need(20);
                drop(6);
                ops.push(...opRect(MARGIN_X - 4, y - 12, CONTENT_W + 8, 16, ...GREEN_D));
                ops.push(...opColorText(centerX(cmd.text, 7.5), y - 3, 'F1', 7.5, cmd.text, ...GOLD));
                drop(16);
                break;
            }

            case 'divider': {
                need(10);
                ops.push(...opLine(MARGIN_X, y - 4, RIGHT_X, y - 4));
                drop(10);
                break;
            }

            case 'spacer':
                drop(cmd.h ?? 10);
                break;
        }
    }

    if (ops.length) flush();
    return pages;
};

// ─── Ensamblador de PDF raw ───────────────────────────────────────────────────

/**
 * Toma páginas con operaciones PDF y construye un archivo PDF/1.4 válido.
 * Usa un array de partes para evitar concatenaciones de strings costosas.
 */
const generatePdfFromCommands = (commands) => {
    const pages = buildPages(commands);
    const N     = pages.length;

    const pageBase    = 3;
    const contentBase = pageBase + N;
    const fontF1Id    = contentBase + N;
    const fontF2Id    = fontF1Id + 1;
    const totalObjs   = fontF2Id;

    const pageIds = Array.from({ length: N }, (_, i) => pageBase + i);
    const kidsRef = pageIds.map((id) => `${id} 0 R`).join(' ');
    const fontRes = `/Font << /F1 ${fontF1Id} 0 R /F2 ${fontF2Id} 0 R >>`;

    const parts   = [];
    const offsets = [];

    const pushObj = (str) => {
        offsets.push(parts.reduce((acc, p) => acc + Buffer.byteLength(p, 'utf8'), 0));
        parts.push(str);
    };

    // Header PDF
    parts.push('%PDF-1.4\n');

    pushObj(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    pushObj(`2 0 obj\n<< /Type /Pages /Kids [${kidsRef}] /Count ${N} >>\nendobj\n`);

    for (let i = 0; i < N; i++) {
        const pid = pageBase + i;
        const cid = contentBase + i;
        pushObj(
            `${pid} 0 obj\n` +
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}]\n` +
            `   /Resources << ${fontRes} >> /Contents ${cid} 0 R >>\nendobj\n`
        );
    }

    for (let i = 0; i < N; i++) {
        const cid  = contentBase + i;
        const body = pages[i].ops.flat().join('\n');
        pushObj(
            `${cid} 0 obj\n<< /Length ${Buffer.byteLength(body, 'utf8')} >>\nstream\n${body}\nendstream\nendobj\n`
        );
    }

    pushObj(`${fontF1Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);
    pushObj(`${fontF2Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

    // Cross-reference table
    const xrefOffset = parts.reduce((acc, p) => acc + Buffer.byteLength(p, 'utf8'), 0);
    parts.push(`xref\n0 ${totalObjs + 1}\n`);
    parts.push('0000000000 65535 f \n');
    for (const offset of offsets) {
        parts.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
    }
    parts.push(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\n`);
    parts.push(`startxref\n${xrefOffset}\n%%EOF`);

    return Buffer.from(parts.join(''), 'utf8');
};

// ─── Export público ───────────────────────────────────────────────────────────

/**
 * Genera el PDF de un reporte de restaurante.
 * @param {Object} reporte  - Documento Mongoose del reporte (populado con restaurante.nombre)
 * @returns {Buffer}        - Buffer con el contenido PDF
 */
export const generateReportePdf = (reporte) => {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT') : '—';
    const titulo  = TIPO_LABEL[reporte.tipoReporte] ?? reporte.tipoReporte;
    const entries = Object.entries(reporte.data ?? {});

    const commands = [
        {
            type:        'coverHeader',
            title:       titulo,
            restaurante: reporte.restaurante?.nombre ?? 'Restaurante',
            generadoPor: `Generado por: ${reporte.generadoPor?.userId ?? '—'}`,
        },
        { type: 'spacer', h: 14 },

        { type: 'sectionHeader', text: normalizeText('Información del reporte') },
        { type: 'keyvalue', key: 'Restaurante',     value: reporte.restaurante?.nombre ?? '—', zebra: false },
        { type: 'keyvalue', key: 'Tipo de reporte', value: titulo,                             zebra: true  },
        { type: 'keyvalue', key: 'Fecha de inicio', value: fmtDate(reporte.fechaInicio),       zebra: false },
        { type: 'keyvalue', key: 'Fecha de fin',    value: fmtDate(reporte.fechaFin),          zebra: true  },
        { type: 'keyvalue', key: 'Generado por',    value: reporte.generadoPor?.userId ?? '—', zebra: false },
        { type: 'keyvalue', key: 'Fecha generación', value: fmtDate(reporte.createdAt),        zebra: true  },
        { type: 'spacer', h: 14 },

        { type: 'sectionHeader', text: 'Datos del reporte' },
        { type: 'spacer', h: 4 },

        ...(entries.length > 0
            ? entries.map(([key, value], i) => ({
                type:  'dataRow',
                key:   key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                index: i,
            }))
            : [{ type: 'text', text: 'Sin datos registrados para este periodo.' }]
        ),

        { type: 'spacer', h: 14 },
        { type: 'footer', text: 'Documento generado electrónicamente. No requiere firma ni sello.' },
    ];

    return generatePdfFromCommands(commands);
};