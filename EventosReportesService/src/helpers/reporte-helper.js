const normalizeText = (text) =>
    String(text)
        .replace(/á/g, 'a').replace(/Á/g, 'A')
        .replace(/é/g, 'e').replace(/É/g, 'E')
        .replace(/í/g, 'i').replace(/Í/g, 'I')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ú/g, 'u').replace(/Ú/g, 'U')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
        .replace(/¿/g, '?').replace(/¡/g, '!')
        .replace(/—/g, '-')
        .replace(/–/g, '-');

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

// Paleta de colores

const GREEN_D = [0.063, 0.275, 0.133];
const GREEN_M = [0.118, 0.467, 0.235];
const GREEN_L = [0.902, 0.957, 0.914];
const GOLD    = [0.824, 0.647, 0.173];
const GREY_L  = [0.965, 0.965, 0.965];
const WHITE   = [1, 1, 1];

// Constantes de dominio

const TIPO_LABEL = {
    VENTAS:           'Reporte de Ventas',
    RESERVACIONES:    'Reporte de Reservaciones',
    INVENTARIO:       'Reporte de Inventario',
    PLATOS_POPULARES: 'Reporte de Platos Populares',
};

const SECCIONES_REPORTE = {

    VENTAS: [
        {
            titulo: 'a. Demanda y volumen de pedidos',
            campos: [
                { key: 'Total de pedidos',           field: 'totalPedidos'          },
                { key: 'Pedidos entregados',          field: 'pedidosEntregados'     },
                { key: 'Pedidos cancelados',          field: 'pedidosCancelados'     },
                { key: 'Pedidos a domicilio',         field: 'pedidosDomicilio'      },
                { key: 'Pedidos para llevar',         field: 'pedidosParaLlevar'     },
                { key: 'Pedidos en restaurante',      field: 'pedidosEnRestaurante'  },
            ],
        },
        {
            titulo: 'b. Desempeno financiero',
            campos: [
                { key: 'Ingresos totales (Q)',        field: 'totalIngresos'         },
                { key: 'Ticket promedio (Q)',         field: 'ticketPromedio'        },
                { key: 'Total propinas (Q)', field: 'totalPropinas' },
            ],
        },
        {
            titulo: 'c. Exportacion',
            campos: [],
            nota: 'Reporte exportado en formato PDF. Para Excel utilice el endpoint /excel.',
        },
    ],

    RESERVACIONES: [
        {
            titulo: 'a. Demanda y numero de reservaciones',
            campos: [
                { key: 'Total reservaciones',        field: 'totalReservaciones'              },
                { key: 'Confirmadas',                field: 'reservacionesConfirmadas'        },
                { key: 'Completadas',                field: 'reservacionesCompletadas'        },
                { key: 'Pendientes',                 field: 'reservacionesPendientes'         },
                { key: 'Canceladas',                 field: 'reservacionesCanceladas'         },
                { key: 'Tasa de cancelacion',        field: 'tasaCancelacion'                 },
            ],
        },
        {
            titulo: 'b. Desempeno y ocupacion',
            campos: [
                { key: 'Promedio personas/reserv.',  field: 'promedioPersonasPorReservacion'  },
                { key: 'Total mesas',                field: 'totalMesas'                      },
                { key: 'Mesas disponibles',          field: 'mesasDisponibles'                },
                { key: 'Mesas ocupadas',             field: 'mesasOcupadas'                   },
            ],
        },
        {
            titulo: 'c. Exportacion',
            campos: [],
            nota: 'Reporte exportado en formato PDF. Para Excel utilice el endpoint /excel.',
        },
    ],

    INVENTARIO: [
        {
            titulo: 'a. Estado general del inventario',
            campos: [
                { key: 'Total items registrados',    field: 'totalItems'           },
                { key: 'Items con stock normal',     field: 'itemsStockNormal'     },
                { key: 'Items bajo stock minimo',    field: 'itemsBajoStock'       },
                { key: 'Items sin stock',            field: 'itemsSinStock'        },
                { key: 'Alertas criticas totales',   field: 'alertasCriticas'      },
            ],
        },
        {
            titulo: 'b. Item mas critico',
            campos: [
                { key: 'Nombre del item',            field: 'itemMasCritico'       },
                { key: 'Cantidad actual',            field: 'cantidadItemCritico'  },
                { key: 'Stock minimo requerido',     field: 'minStockItemCritico'  },
            ],
        },
        {
            titulo: 'c. Exportacion',
            campos: [],
            nota: 'Reporte exportado en formato PDF. Para Excel utilice el endpoint /excel.',
        },
    ],

    PLATOS_POPULARES: [
        {
            titulo: 'a. Platos mas vendidos y demanda',
            campos: [
                { key: 'Total platos vendidos',      field: 'totalPlatosVendidos'   },
                { key: '1er lugar',                  field: 'top1Plato'             },
                { key: '1er lugar - unidades',       field: 'top1Vendidos'          },
                { key: '1er lugar - ingresos (Q)',   field: 'top1Ingresos'          },
                { key: '2do lugar',                  field: 'top2Plato'             },
                { key: '2do lugar - unidades',       field: 'top2Vendidos'          },
                { key: '2do lugar - ingresos (Q)',   field: 'top2Ingresos'          },
                { key: '3er lugar',                  field: 'top3Plato'             },
                { key: '3er lugar - unidades',       field: 'top3Vendidos'          },
                { key: '3er lugar - ingresos (Q)',   field: 'top3Ingresos'          },
                { key: 'Plato menos vendido',        field: 'platoMenosVendido'     },
            ],
        },
        {
            titulo: 'b. Desempeno por categoria y satisfaccion',
            campos: [
                { key: 'Entradas vendidas',          field: 'entradasVendidas'      },
                { key: 'Platos fuertes vendidos',    field: 'platosFuertesVendidos' },
                { key: 'Postres vendidos',           field: 'postresVendidos'       },
                { key: 'Bebidas vendidas',           field: 'bebidasVendidas'       },
                { key: 'Calificacion promedio',      field: 'calificacionPromedio'  },
                { key: 'Total resenas',              field: 'totalResenas'          },
            ],
        },
        {
            titulo: 'c. Exportacion',
            campos: [],
            nota: 'Reporte exportado en formato PDF. Para Excel utilice el endpoint /excel.',
        },
    ],
};

// Motor de paginación

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

// Ensamblador de PDF raw

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

const buildDataCommands = (tipoReporte, data) => {
    const secciones = SECCIONES_REPORTE[tipoReporte];
    const commands  = [];

    if (!secciones) {
        // Modo genérico (fallback)
        const entries = Object.entries(data ?? {});
        commands.push({ type: 'sectionHeader', text: 'Datos del reporte' });
        commands.push({ type: 'spacer', h: 4 });
        if (entries.length === 0) {
            commands.push({ type: 'text', text: 'Sin datos registrados para este periodo.' });
        } else {
            entries.forEach(([key, value], i) => {
                commands.push({
                    type:  'dataRow',
                    key:   normalizeText(key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())),
                    value: normalizeText(typeof value === 'object' ? JSON.stringify(value) : String(value)),
                    index: i,
                });
            });
        }
        return commands;
    }

    secciones.forEach((seccion) => {
        commands.push({ type: 'spacer', h: 8 });
        commands.push({ type: 'sectionHeader', text: normalizeText(seccion.titulo) });
        commands.push({ type: 'spacer', h: 4 });

        if (seccion.nota) {
            // Sección c: solo nota de exportación
            commands.push({ type: 'text', text: normalizeText(seccion.nota) });
        } else if (seccion.campos.length === 0) {
            commands.push({ type: 'text', text: 'Sin datos.' });
        } else {
            seccion.campos.forEach((campo, i) => {
                const rawValue = data?.[campo.field];
                const value    = rawValue !== undefined && rawValue !== null
                    ? normalizeText(String(rawValue))
                    : '—';
                commands.push({
                    type:  'dataRow',
                    key:   normalizeText(campo.key),
                    value,
                    index: i,
                });
            });
        }
    });

    return commands;
};

// Export público 

export const generateReportePdf = (reporte) => {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-GT') : '—';
    const titulo  = normalizeText(TIPO_LABEL[reporte.tipoReporte] ?? reporte.tipoReporte);

    const restauranteNombre = normalizeText(reporte.restaurante?.nombre ?? 'Restaurante');
    const generadoPorName   = normalizeText(reporte.generadoPor?.name ?? reporte.generadoPor?.userId ?? '—');
    const generadoPorId     = reporte.generadoPor?.userId ?? '—';

    const commands = [
        // Encabezado 
        {
            type:        'coverHeader',
            title:       titulo,
            restaurante: restauranteNombre,
        },
        { type: 'spacer', h: 14 },

        // Información del reporte
        { type: 'sectionHeader', text: 'Informacion del reporte' },
        { type: 'keyvalue', key: 'Restaurante',      value: restauranteNombre,              zebra: false },
        { type: 'keyvalue', key: 'Tipo de reporte',  value: titulo,                         zebra: true  },
        { type: 'keyvalue', key: 'Fecha de inicio',  value: fmtDate(reporte.fechaInicio),   zebra: false },
        { type: 'keyvalue', key: 'Fecha de fin',     value: fmtDate(reporte.fechaFin),      zebra: true  },
        { type: 'keyvalue', key: 'Generado por ID',  value: generadoPorId,                  zebra: false },
        { type: 'keyvalue', key: 'Generado por',     value: generadoPorName,                zebra: true  },
        { type: 'keyvalue', key: 'Fecha generacion', value: fmtDate(reporte.createdAt),     zebra: false },
        { type: 'spacer', h: 6 },

        // Datos del reporte (secciones a, b, c)
        ...buildDataCommands(reporte.tipoReporte, reporte.data ?? {}),

        // Pie de página 
        { type: 'spacer', h: 18 },
        { type: 'footer', text: 'Documento generado electronicamente. No requiere firma ni sello.' },
    ];

    return generatePdfFromCommands(commands);
};