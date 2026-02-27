// ─── PDF primitives (mismo motor que reporte.helper.js) ──────────────────────

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
const rightX      = (text, fs) => RIGHT_X  - approxWidth(text, fs);

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

// ─── Paleta ───────────────────────────────────────────────────────────────────

const GREEN_D = [0.063, 0.275, 0.133];  // #104523
const GREEN_M = [0.118, 0.467, 0.235];  // #1E773C
const GREEN_L = [0.902, 0.957, 0.914];  // #E6F4E9
const GOLD    = [0.824, 0.647, 0.173];  // #D2A52C
const GREY_L  = [0.965, 0.965, 0.965];
const GREY_M  = [0.878, 0.878, 0.878];
const WHITE   = [1, 1, 1];

// ─── Columnas de la tabla de items ───────────────────────────────────────────

const COL = {
    num:      MARGIN_X + 4,          // #
    nombre:   MARGIN_X + 28,         // Plato
    cantidad: MARGIN_X + 320,        // Cant.
    precio:   MARGIN_X + 390,        // Precio unit.
    subtotal: RIGHT_X  - 4,          // Subtotal (right-aligned)
};

// ─── Motor de paginación ─────────────────────────────────────────────────────

const buildPages = (commands) => {
    const pages = [];
    let ops = [];
    let y   = PAGE_H - MARGIN_Y;

    const flush = () => { pages.push({ ops }); ops = []; y = PAGE_H - MARGIN_Y; };
    const need  = (h) => { if (y - h < MARGIN_Y + 30) flush(); };
    const drop  = (h) => { y -= h; };

    for (const cmd of commands) {
        switch (cmd.type) {

            // ── Encabezado de factura ─────────────────────────────────────
            case 'facturaHeader': {
                const blockH = 100;
                need(blockH + 20);

                // Fondo verde oscuro
                ops.push(...opRect(0, PAGE_H - MARGIN_Y - blockH, PAGE_W, blockH + MARGIN_Y, ...GREEN_D));
                // Línea dorada inferior
                ops.push(...opRect(0, PAGE_H - MARGIN_Y - blockH - 3, PAGE_W, 3, ...GOLD));

                // FACTURA (título grande)
                ops.push(...opColorText(
                    centerX('FACTURA', 28), PAGE_H - MARGIN_Y - 38,
                    'F2', 28, 'FACTURA', ...WHITE
                ));
                // Restaurante
                ops.push(...opColorText(
                    centerX(cmd.restaurante, 12), PAGE_H - MARGIN_Y - 62,
                    'F1', 12, cmd.restaurante, ...GOLD
                ));
                // No. factura (derecha)
                ops.push(...opColorText(
                    rightX(`No. ${cmd.facturaId}`, 8), PAGE_H - MARGIN_Y - 82,
                    'F1', 8, `No. ${cmd.facturaId}`, 0.7, 0.9, 0.7
                ));
                // Fecha (derecha)
                ops.push(...opColorText(
                    rightX(cmd.fecha, 8), PAGE_H - MARGIN_Y - 93,
                    'F1', 8, cmd.fecha, 0.7, 0.9, 0.7
                ));

                drop(blockH + 14);
                break;
            }

            // ── Sección info pedido ───────────────────────────────────────
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

            // ── Fila clave-valor (info pedido) ────────────────────────────
            case 'keyvalue': {
                const h = 16;
                need(h);
                if (cmd.zebra) ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREY_L));
                ops.push(opText(MARGIN_X + 4,           y - 2, 'F1', 8.5, cmd.key));
                ops.push(opText(rightX(cmd.value, 8.5), y - 2, 'F1', 8.5, cmd.value));
                drop(h);
                break;
            }

            // ── Encabezado de tabla de items ──────────────────────────────
            case 'tableHeader': {
                const h = 20;
                need(h + 4);
                drop(4);
                ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREEN_D));
                ops.push(...opColorText(COL.num,      y - 4, 'F2', 8, '#',          ...WHITE));
                ops.push(...opColorText(COL.nombre,   y - 4, 'F2', 8, 'Plato',      ...WHITE));
                ops.push(...opColorText(COL.cantidad, y - 4, 'F2', 8, 'Cant.',      ...WHITE));
                ops.push(...opColorText(COL.precio,   y - 4, 'F2', 8, 'Precio',     ...WHITE));
                ops.push(...opColorText(rightX('Subtotal', 8) - 4, y - 4, 'F2', 8, 'Subtotal', ...WHITE));
                drop(h + 2);
                break;
            }

            // ── Fila de item ──────────────────────────────────────────────
            case 'itemRow': {
                const h = 18;
                need(h);
                if (cmd.index % 2 === 0) {
                    ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREY_L));
                }
                const subtotal = (cmd.cantidad * cmd.precio).toFixed(2);
                ops.push(opText(COL.num,                                  y - 3, 'F1', 8, String(cmd.index + 1)));
                ops.push(opText(COL.nombre,                               y - 3, 'F1', 8, normalizeText(cmd.nombre)));
                ops.push(opText(COL.cantidad,                             y - 3, 'F1', 8, String(cmd.cantidad)));
                ops.push(opText(COL.precio,                               y - 3, 'F1', 8, `Q ${Number(cmd.precio).toFixed(2)}`));
                ops.push(opText(rightX(`Q ${subtotal}`, 8) - 4,           y - 3, 'F1', 8, `Q ${subtotal}`));
                drop(h);
                break;
            }

            // ── Línea separadora ──────────────────────────────────────────
            case 'divider': {
                need(10);
                ops.push(...opLine(MARGIN_X, y - 4, RIGHT_X, y - 4));
                drop(10);
                break;
            }

            // ── Fila de totales (subtotal / impuesto / total) ─────────────
            case 'totalRow': {
                const h = 18;
                need(h + 2);
                if (cmd.highlight) {
                    ops.push(...opRect(MARGIN_X - 4, y - h + 4, CONTENT_W + 8, h, ...GREEN_L));
                }
                ops.push(opText(
                    cmd.highlight
                        ? rightX(cmd.key, 9) - 120
                        : rightX(cmd.key, 8.5) - 120,
                    y - 3,
                    cmd.highlight ? 'F2' : 'F1',
                    cmd.highlight ? 9 : 8.5,
                    cmd.key
                ));
                ops.push(
                    cmd.highlight
                        ? opText(rightX(cmd.value, 9) - 4, y - 3, 'F2', 9, cmd.value)
                        : opText(rightX(cmd.value, 8.5) - 4, y - 3, 'F1', 8.5, cmd.value)
                );
                drop(h + 2);
                break;
            }

            // ── Línea de total final ──────────────────────────────────────
            case 'totalFinal': {
                const h = 24;
                need(h + 6);
                drop(6);
                ops.push(...opLine(MARGIN_X, y + 2, RIGHT_X, y + 2, 1, ...GREEN_M));
                ops.push(...opRect(MARGIN_X - 4, y - h + 6, CONTENT_W + 8, h, ...GREEN_D));
                ops.push(...opColorText(rightX(cmd.key, 11) - 120, y - 4, 'F2', 11, cmd.key,   ...GOLD));
                ops.push(...opColorText(rightX(cmd.value, 11) - 4, y - 4, 'F2', 11, cmd.value, ...WHITE));
                drop(h + 4);
                break;
            }

            // ── Texto secundario ──────────────────────────────────────────
            case 'text': {
                need(14);
                ops.push(...opColorText(MARGIN_X + 4, y - 2, 'F1', 7.5, cmd.text, 0.35, 0.35, 0.35));
                drop(14);
                break;
            }

            // ── Footer ────────────────────────────────────────────────────
            case 'footer': {
                need(20);
                drop(6);
                ops.push(...opRect(MARGIN_X - 4, y - 12, CONTENT_W + 8, 16, ...GREEN_D));
                ops.push(...opColorText(centerX(cmd.text, 7.5), y - 3, 'F1', 7.5, cmd.text, ...GOLD));
                drop(16);
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
 * Genera el PDF de una factura.
 * @param {Object} factura     - Documento Mongoose de la factura
 * @param {Object} pedido      - Documento Mongoose del pedido (populado con restaurante)
 * @param {Array}  detalles    - Array de DetallePedido populados con plato
 * @returns {Buffer}
 */
export const generateFacturaPdf = (factura, pedido, detalles) => {
    const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('es-GT') : '—';
    const fmtMoney = (n) => `Q ${Number(n ?? 0).toFixed(2)}`;

    const restauranteNombre = normalizeText(
        pedido?.restaurante?.nombre ?? 'Restaurante'
    );

    const commands = [
        // ── Encabezado ──────────────────────────────────────────────────
        {
            type:        'facturaHeader',
            restaurante: restauranteNombre,
            facturaId:   factura._id.toString().slice(-8).toUpperCase(),
            fecha:       fmtDate(factura.createdAt),
        },
        { type: 'spacer', h: 16 },

        // ── Info del pedido ─────────────────────────────────────────────
        { type: 'sectionHeader', text: 'Informacion del pedido' },
        { type: 'keyvalue', key: 'No. Pedido',     value: pedido?._id?.toString().slice(-8).toUpperCase() ?? '—', zebra: false },
        { type: 'keyvalue', key: 'Restaurante',    value: restauranteNombre,                                       zebra: true  },
        { type: 'keyvalue', key: 'Tipo de pedido', value: normalizeText(pedido?.tipoPedido ?? '—'),                zebra: false },
        { type: 'keyvalue', key: 'Estado',         value: normalizeText(pedido?.estadoPedido ?? '—'),              zebra: true  },
        { type: 'keyvalue', key: 'Fecha',          value: fmtDate(pedido?.createdAt),                             zebra: false },
        { type: 'spacer', h: 16 },

        // ── Tabla de items ──────────────────────────────────────────────
        { type: 'sectionHeader', text: 'Detalle de productos' },
        { type: 'spacer', h: 4 },
        { type: 'tableHeader' },

        ...(detalles.length > 0
            ? detalles.map((d, i) => ({
                type:     'itemRow',
                index:    i,
                nombre:   d.plato?.nombrePlato ?? 'Plato eliminado',
                cantidad: d.cantidad,
                precio:   d.precio,
            }))
            : [{ type: 'text', text: 'Sin items registrados en este pedido.' }]
        ),

        { type: 'spacer', h: 12 },
        { type: 'divider' },
        { type: 'spacer', h: 4 },

        // ── Totales ─────────────────────────────────────────────────────
        { type: 'totalRow', key: 'Subtotal:',  value: fmtMoney(factura.subtotal), highlight: false },
        { type: 'totalRow', key: 'Impuesto:',  value: fmtMoney(factura.impuesto), highlight: false },
        { type: 'spacer', h: 4 },
        { type: 'totalFinal', key: 'TOTAL:', value: fmtMoney(factura.total) },

        { type: 'spacer', h: 20 },
        { type: 'text', text: `Factura generada el ${fmtDate(factura.createdAt)}` },
        { type: 'spacer', h: 6 },
        { type: 'footer', text: 'Documento generado electronicamente. No requiere firma ni sello.' },
    ];

    return generatePdfFromCommands(commands);
};