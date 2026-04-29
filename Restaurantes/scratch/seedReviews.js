import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const URI = process.env.URI_MONGO || 'mongodb://127.0.0.1:27017/restaurantesdb';

async function seed() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(URI);
        console.log('Conectado exitosamente.');

        const Restaurante = mongoose.connection.collection('restaurantes');
        const Reseña = mongoose.connection.collection('reseñas');

        const restaurantes = await Restaurante.find({ isActive: true }).limit(3).toArray();

        if (restaurantes.length === 0) {
            console.log('No se encontraron restaurantes activos para sembrar reseñas.');
            process.exit(0);
        }

        const defaultReviews = [
            {
                usuario: 'usr_admin_1',
                comentario: '¡Excelente comida y atención! Los sabores son muy auténticos.',
                calificacion: 5,
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                usuario: 'usr_guest_1',
                comentario: 'Buena experiencia, aunque el tiempo de espera fue un poco largo.',
                calificacion: 4,
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                usuario: 'usr_foodie_99',
                comentario: 'La decoración es hermosa y el postre de chocolate es imperdible.',
                calificacion: 5,
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        let count = 0;
        for (const rest of restaurantes) {
            for (const baseReview of defaultReviews) {
                const reviewToInsert = {
                    ...baseReview,
                    restaurante: rest._id,
                    // Variar un poco el comentario por restaurante
                    comentario: `${baseReview.comentario} (Visitado en ${rest.nombre})`
                };

                // Verificar si ya existe
                const exists = await Reseña.findOne({ 
                    usuario: reviewToInsert.usuario, 
                    restaurante: reviewToInsert.restaurante 
                });

                if (!exists) {
                    await Reseña.insertOne(reviewToInsert);
                    count++;
                }
            }
        }

        console.log(`Sembrado completado: ${count} reseñas añadidas.`);
        process.exit(0);
    } catch (error) {
        console.error('Error al sembrar reseñas:', error);
        process.exit(1);
    }
}

seed();
