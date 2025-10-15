const express = require('express');
const router = express.Router();
//const User = require('../models/User'); // Para interactuar con la tabla users
//const bcrypt = require('bcrypt'); // Para hashear contraseñas
//const jwt = require('jsonwebtoken'); // Para crear tokens
const authService = require('../services/authService');

// ------------------------------------------------
// ⚠️ IMPORTANTE: Necesitas una clave secreta fuerte en tu .env
// ------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_debe_ser_fuerte'; 

// POST /api/auth/register
// Endpoint para que un nuevo usuario se registre
router.post('/register', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Faltan el email o la contraseña.' });
    }

    try {
        // 🔑 Lógica de negocio en una sola línea
        const { token } = await authService.registerUser(email, password);
        
        // Enviamos el token en la respuesta
        res.status(201).send({ message: 'Usuario registrado con éxito.', token: token });

    } catch (error) {
        console.error("Error al registrar:", error);
        // Usamos el estado del error del servicio (409) o pasamos un 500
        res.status(error.status || 500).send({ error: error.message });
        // NOTA: Para errores 500, podrías usar next(error) para el handler global
        // pero para errores 409 o 401, se recomienda manejarlos localmente.
    }
});

// POST /api/auth/login
// Endpoint para que un usuario inicie sesión y obtenga un token JWT
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

     if (!email || !password) {
        return res.status(400).send({ error: 'Faltan el correo o la contraseña.' });
    }

    try {
        // 🔑 Lógica de negocio en una sola línea
        const { token } = await authService.loginUser(email, password);

        // Enviamos el token
        res.status(200).send({ message: 'Inicio de sesión exitoso.', token: token });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        // Usamos el estado del error del servicio (401) o pasamos un 500
        res.status(error.status || 500).send({ error: error.message });
    }
});

module.exports = router;

