// Este es el middleware de manejo de errores global.
// Express lo reconoce por tener CUATRO parámetros (err, req, res, next).
const errorHandler = (err, req, res, next) => {
    // Determina el código de estado HTTP. Si el error tiene un status, úsalo, 
    // si no, asume un error interno del servidor (500).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Si el error es una instancia de Error, extrae el mensaje.
    const message = err.message || 'Fallo interno del servidor desconocido.';

    res.status(statusCode).json({
        status: statusCode,
        message: message,
        // En desarrollo, mostramos el stack trace para depuración.
        // En producción, esto debe ser eliminado.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };