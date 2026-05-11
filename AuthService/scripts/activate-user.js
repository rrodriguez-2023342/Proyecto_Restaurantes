
import { findUserByEmail, markEmailAsVerified } from '../helpers/user-db.js';
import { User } from '../src/users/user.model.js';

async function activate() {
    const email = 'veterinariacorp@gmail.com';
    try {
        console.log(`Buscando usuario: ${email}...`);
        const user = await findUserByEmail(email);
        
        if (!user) {
            console.error('¡Error! Usuario no encontrado.');
            process.exit(1);
        }

        console.log(`Usuario encontrado: ${user.Username} (ID: ${user.Id})`);
        console.log('Activando cuenta y verificando email...');
        
        await markEmailAsVerified(user.Id);
        
        console.log('-----------------------------------------');
        console.log('✅ ¡CUENTA ACTIVADA EXITOSAMENTE!');
        console.log('-----------------------------------------');
        console.log('Ya puedes ir al login e iniciar sesión.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la activación:', error);
        process.exit(1);
    }
}

activate();
