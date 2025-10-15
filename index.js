// index.js (VERSIÓN CORREGIDA Y CONSOLIDADA)

require('dotenv').config(); 
// Asumiendo que 'sequelize' y 'connectDB' se definen en config/database
const { sequelize, connectDB } = require('./config/database'); 
const express = require('express');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

// ------------------------------------------
// DEFINICIÓN DE LA APP Y PUERTO (fuera de la función para ser global)
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware y Configuración Global (¡AHORA DEFINIDOS ANTES DEL INICIO!)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log('📄 Documentación de API disponible en /api-docs');

// --- RUTAS ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const keyRoutes = require('./routes/keyRoutes');
app.use('/api/keys', keyRoutes);

// 5. Middleware de manejo de ERRORES (debe ser el último)
app.use(errorHandler);


// ------------------------------------------------------------------
// 🔑 FUNCIÓN ÚNICA DE INICIO (CRÍTICA PARA DOCKER)
async function startServer() {
    try {
        // 1. CONEXIÓN A DB
        await connectDB(); // Llama a la función que debería configurar/usar el sequelize global
        await sequelize.authenticate(); 
        await sequelize.sync({ force: false }); 
        
        console.log('✅ Conexión a DB establecida con éxito.');

        // 2. INICIA EL SERVIDOR
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Express iniciado en el puerto ${PORT}`);
        });

    } catch (error) {
        // 🚨 SI FALLA, MATA EL CONTENEDOR
        console.error('❌ No se pudo conectar a la base de datos. Reiniciando...');
        console.error(error.message);
        
        // Esto activará 'restart: always' de Docker Compose
        process.exit(1); 
    }
}

// Llama a la única función de inicio
startServer();