const jwt = require('jsonwebtoken');

// La clave secreta debe ser la misma que usamos para firmar el token
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_debe_ser_fuerte'; 

// Esta función se ejecutará ANTES de la lógica de las rutas protegidas
const protect = (req, res, next) => {
    // 1. Obtener el token del encabezado (header) de la solicitud
    let token;

    // Los tokens JWT generalmente se envían así: 'Bearer [token-aqui]'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extrae el token (quita la palabra 'Bearer ')
        token = req.headers.authorization.split(' ')[1]; 
    }

    // 2. Si no hay token, el acceso es denegado
    if (!token) {
        return res.status(401).send({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // 3. Verificar el token usando nuestra clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Adjuntar el ID del usuario decodificado a la solicitud (req)
        // Esto es CLAVE: ahora todas las rutas posteriores sabrán qué usuario es.
        req.user = decoded; 

        // 5. Si todo está bien, pasar al siguiente middleware o al endpoint final
        next(); 

    } catch (error) {
        console.error("Token inválido o expirado:", error);
        return res.status(401).send({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { protect };