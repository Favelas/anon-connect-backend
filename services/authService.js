const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// La clave secreta debe ser la misma que la usada en el middleware/auth.js
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_debe_ser_fuerte'; 

// Función auxiliar para generar el Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
    });
};

/**
 * Registra un nuevo usuario en la base de datos.
 * @param {string} email 
 * @param {string} password 
 * @returns {object} El token JWT.
 */
async function registerUser(email, password) {
    // 1. Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        // Lanzamos un error que el controlador atrapará
        const error = new Error('El usuario con este correo ya existe.');
        error.status = 409; // Conflicto
        throw error;
    }

    // 2. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario
    const user = await User.create({
        email: email,
        password: hashedPassword,
    });

    // 4. Generar Token y devolverlo
    return { token: generateToken(user.id) };
}

/**
 * Inicia sesión de un usuario y verifica la contraseña.
 * @param {string} email 
 * @param {string} password 
 * @returns {object} El token JWT.
 */
async function loginUser(email, password) {
    // 1. Buscar el usuario
    const user = await User.findOne({ where: { email } });

    // 2. Si no existe o la contraseña no coincide
    if (!user || !(await bcrypt.compare(password, user.password))) {
        // Lanzamos un error que el controlador atrapará
        const error = new Error('Credenciales inválidas.');
        error.status = 401; // No autorizado
        throw error;
    }

    // 3. Generar Token y devolverlo
    return { token: generateToken(user.id) };
}

module.exports = {
    registerUser,
    loginUser,
};