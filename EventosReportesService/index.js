import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

dotenv.config();

process.on('uncaughtException', (err) => {
    console.log('Uncought Exception in EventosReportesService:', err);
    process.exit(1);
});

process.on('unhadledRejection', (err, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', err);
    process.exit(1);
});

console.log('Starting EventosReportesService...');
initServer();
