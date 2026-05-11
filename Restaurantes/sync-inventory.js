import mongoose from 'mongoose';

const syncInventory = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/restaurantesdb');
        console.log('Iniciando sincronización profunda de inventario...');
        
        const detalles = await mongoose.connection.db.collection('detallepedidos').find().toArray();
        let totalMovimientos = 0;

        for (const detalle of detalles) {
            for (const item of detalle.items) {
                const plato = await mongoose.connection.db.collection('platos').findOne({ _id: item.plato });
                
                if (plato && plato.ingredientes) {
                    let ingredientes = [];
                    try {
                        ingredientes = JSON.parse(plato.ingredientes);
                    } catch (e) {
                        // Si ya es un array (por si acaso)
                        if (Array.isArray(plato.ingredientes)) {
                            ingredientes = plato.ingredientes;
                        }
                    }

                    for (const ing of ingredientes) {
                        if (ing.itemInventario) {
                            const cantidadARestar = parseFloat(ing.cantidad) * item.cantidad;
                            await mongoose.connection.db.collection('inventarios').updateOne(
                                { _id: new mongoose.Types.ObjectId(ing.itemInventario) },
                                { $inc: { cantidad: -cantidadARestar } }
                            );
                            totalMovimientos++;
                        }
                    }
                }
            }
        }

        console.log('Sincronización completada con éxito.');
        console.log('Total de ingredientes descontados:', totalMovimientos);
        process.exit(0);
    } catch (error) {
        console.error('Error durante la sincronización:', error);
        process.exit(1);
    }
};

syncInventory();
