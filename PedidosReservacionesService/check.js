import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/restaurantesdb').then(async () => {
    const Plato = mongoose.model('Plato', new mongoose.Schema({}, { strict: false }));
    const platos = await Plato.find();
    console.log(JSON.stringify(platos.map(p => ({
        nombre: p.nombrePlato,
        ing: p.ingredientes
    })), null, 2));
    process.exit(0);
}).catch(console.error);
