import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Determinar el directorio actual y cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import Pedido from './src/models/pedidos/pedido.model.js';
import DetallePedido from './src/models/detallePedidos/detallePedido.model.js';
import Plato from './src/models/platos/plato.model.js';
import Inventario from './src/models/inventario/inventario.model.js';

const URI_MONGO = process.env.URI_MONGO || 'mongodb://127.0.0.1:27017/restaurantesdb';

async function fixInventory() {
    try {
        console.log('Conectando a la base de datos...', URI_MONGO);
        await mongoose.connect(URI_MONGO);
        console.log('Conexión exitosa.');

        // Obtener todos los detalles de pedidos
        const detalles = await DetallePedido.find().populate('pedido');
        console.log(`Encontrados ${detalles.length} detalles de pedido para procesar.`);

        for (const detalle of detalles) {
            if (!detalle.pedido) {
                console.log(`Detalle ${detalle._id} no tiene pedido válido. Saltando.`);
                continue;
            }

            console.log(`Procesando pedido: ${detalle.pedido._id}`);
            
            for (const item of detalle.items) {
                const plato = await Plato.findById(item.plato);
                if (!plato) {
                    console.log(`  - Plato no encontrado: ${item.plato}`);
                    continue;
                }

                console.log(`  - Plato: ${plato.nombrePlato} (Cantidad pedida: ${item.cantidad})`);
                
                if (!plato.ingredientes || plato.ingredientes.length === 0) {
                    console.log(`    - El plato no tiene ingredientes configurados.`);
                    continue;
                }

                for (const ing of plato.ingredientes) {
                    if (!ing.itemInventario) continue;
                    
                    const invItem = await Inventario.findById(ing.itemInventario);
                    if (invItem) {
                        const cantARestar = ing.cantidad * item.cantidad;
                        console.log(`    - Restando ${cantARestar} de inventario: ${invItem.nombreItem} (Stock actual: ${invItem.cantidad})`);
                        
                        invItem.cantidad -= cantARestar;
                        if (invItem.cantidad < 0) invItem.cantidad = 0;
                        await invItem.save();
                        console.log(`      > Nuevo stock: ${invItem.cantidad}`);
                    } else {
                        console.log(`    - Item de inventario no encontrado: ${ing.itemInventario}`);
                    }
                }
            }
        }

        console.log('Proceso de corrección de inventario finalizado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('Error al ejecutar el script:', error);
        process.exit(1);
    }
}

fixInventory();
