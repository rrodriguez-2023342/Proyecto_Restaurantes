const { spawn } = require('node:child_process');
const path = require('node:path');

const services = [
  { name: 'AuthService', path: 'AuthService', port: 3006 },
  { name: 'RestaurantesService', path: 'RestaurantesService', port: 3007 },
  { name: 'PedidosReservacionesService', path: 'PedidosReservacionesService', port: 3008 },
  { name: 'EventosReportesService', path: 'EventosReportesService', port: 3009 },
];

console.log('\nLevantando microservicios en PRODUCCION...\n');

services.forEach((service) => {
  const servicePath = path.join(__dirname, '..', service.path);
  
  spawn('pnpm', ['start'], {
    cwd: servicePath,
    stdio: 'inherit',
    shell: true,
  });

  console.log(`${service.name} iniciado en puerto ${service.port}`);
});

console.log('\nTodos los servicios estan corriendo en produccion\n');

process.on('SIGINT', () => {
  console.log('\nDeteniendo servicios...');
  process.exit(0);
});
