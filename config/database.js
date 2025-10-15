// config/database.js
require('dotenv').config(); 
const { Sequelize } = require('sequelize');

// Inicializa la conexión usando las variables de entorno
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
    }
);

// Función que define y sincroniza los modelos
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos PostgreSQL establecida con éxito.');
        
        // --- AÑADIR AQUI LAS IMPORTACIONES DE MODELOS ---
        // ¡Importar los modelos JUSTO antes de sincronizar!
        require('../models/User'); // Importa el modelo (esto lo registra en Sequelize)
        require('../models/KeyMapping'); // Importa el modelo de la llave
        // --- FIN AÑADIDO ---

        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados con la base de datos.');

    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
}

module.exports = { sequelize, connectDB };