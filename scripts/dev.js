const { spawn } = require('node:child_process');
const path = require('node:path');

const services = [
  {
    name: 'AuthService',
    path: 'AuthService',
    port: 3006,
    color: '\x1b[31m',
    healthUrl: 'http://localhost:3006/api/v1/health',
    docsUrl: 'http://localhost:3006/api/v1/docs',
  },
  {
    name: 'RestaurantesService',
    path: 'RestaurantesService',
    port: 3007,
    color: '\x1b[34m',
    healthUrl: 'http://localhost:3007/restaurantes/v1/Health',
    docsUrl: 'http://localhost:3007/restaurantes/v1/api-docs',
  },
  {
    name: 'PedidosReservacionesService',
    path: 'PedidosReservacionesService',
    port: 3008,
    color: '\x1b[32m',
    healthUrl: 'http://localhost:3008/restaurantes/v1/Health',
    docsUrl: 'http://localhost:3008/restaurantes/v1/api-docs',
  },
  {
    name: 'EventosReportesService',
    path: 'EventosReportesService',
    port: 3009,
    color: '\x1b[33m',
    healthUrl: 'http://localhost:3009/eventos/v1/Health',
    docsUrl: 'http://localhost:3009/eventos/v1/api-docs',
  },
];

const reset = '\x1b[0m';
const children = [];
const BOX_WIDTH = 76;

const log = (color, title, message) => {
  console.log(`${color}[${title}]${reset} ${message}`);
};

const padLine = (label, value = '') => {
  const content = value ? `${label} ${value}` : label;
  return content.length > BOX_WIDTH ? content.slice(0, BOX_WIDTH) : content.padEnd(BOX_WIDTH, ' ');
};

const printBox = (title, lines) => {
  console.log(`+${'-'.repeat(BOX_WIDTH + 2)}+`);
  console.log(`| ${padLine(title)} |`);
  console.log(`+${'-'.repeat(BOX_WIDTH + 2)}+`);
  lines.forEach((line) => {
    console.log(`| ${padLine(line)} |`);
  });
  console.log(`+${'-'.repeat(BOX_WIDTH + 2)}+`);
};

console.log('\nLevantando microservicios Proyecto Restaurantes...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', service.path);

  const child = spawn('pnpm', ['dev'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });

  children.push(child);
  log(service.color, service.name, `iniciando en puerto ${service.port}...`);

  child.on('error', (err) => {
    log(service.color, service.name, `Error: ${err.message}`);
  });

  child.on('close', (code) => {
    log(service.color, service.name, `cerrado con codigo ${code}`);
  });
});

console.log('\nResumen de servicios:\n');
services.forEach((service) => {
  printBox(service.name, [
    `Puerto: ${service.port}`,
    `Health: ${service.healthUrl}`,
    `API Docs: ${service.docsUrl}`,
  ]);
});

console.log('\nPresiona CTRL+C para detener todos los servicios\n');

process.on('SIGINT', () => {
  console.log('\n\nDeteniendo todos los servicios...\n');
  children.forEach((child) => child.kill());
  setTimeout(() => {
    console.log('Todos los servicios han sido detenidos');
    process.exit(0);
  }, 1000);
});
