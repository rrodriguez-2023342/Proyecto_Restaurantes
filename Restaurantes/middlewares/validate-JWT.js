import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {

    const jwtConfig = {
        secret: process.env.JWT_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
    }

    if (!jwtConfig.secret){
        console.error('Error de validación JWT: JWT_SECRET no está definido');
        return res.status(500).json({
            success: false,
            message: 'Configuración del servidor inválida: falta JWT_SECRET'
        })
    }

    let token = 
        req.header('x-token') || 
        req.header('Authorization');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó un token',
            error: 'MISSING_TOKEN'
        })
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
    }
    token = token.trim();

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);

        if(!decoded.role){
            console.warn(
                `Token sin campo 'role' para usuario ${decoded.sub}. Payload:`,
                JSON.stringify(decoded, null, 2)
            )
        }

        // Mantenemos EXACTAMENTE lo que puso tu amigo
        req.user = {
            id: decoded.sub,
            jti: decoded.jti,
            iat: decoded.iat,
            role: decoded.role || 'USER_ROLE'
        }

        // AGREGAMOS esta línea para que tus mesas no fallen
        req.usuario = req.user; 

        next();

    } catch (error) {
        console.error(`Error validando JWT: ${error.message}`);
        
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                error: 'TOKEN_EXPIRED'
            })
        }

        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error: 'INVALID_TOKEN'
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Error al validar el token',
            error: error.message
        })
    }
}