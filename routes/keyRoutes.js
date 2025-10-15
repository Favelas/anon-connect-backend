// routes/keyRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const keyService = require('../services/keyService'); 

// POST /api/keys/generate (Controlador con Prueba de Error)
// Asegúrate de incluir 'next' en la firma
// routes/keyRoutes.js (Solo la ruta /generate refactorizada)

router.post('/generate', protect, async (req, res, next) => { 
    const userId = req.user.id; 
    const { purpose } = req.body; 

    if (!purpose) {
        return res.status(400).send({ error: "El propósito de la llave es obligatorio." });
    }

    try {
        // ✅ ELIMINAR: throw new Error('Esto es un error forzado para probar el manejador global.');
        
        // 🔑 Llama al servicio para manejar TODA la lógica
        const keyData = await keyService.generateKey(userId, purpose);
        
        res.status(201).send({
            message: 'Llave de contacto generada con éxito.',
            ...keyData, 
        });

    } catch (error) {
        console.error("Error al generar llave:", error);
        // Mantener la llamada al manejador global
        next(error); 
    }
});

// DELETE /api/keys/revoke (Controlador usando next)
router.delete('/revoke', protect, async (req, res, next) => { // Incluye 'next'
    const userId = req.user.id; 
    const { alias } = req.body; 

    if (!alias) {
        return res.status(400).send({ error: 'Se requiere el alias para revocar.' });
    }

    try {
        const updatedRows = await keyService.revokeKey(userId, alias);

        if (updatedRows === 0) {
            // Un error 404/403 es mejor manejo local que pasarlo al global.
            return res.status(404).send({ 
                error: 'Alias no encontrado, ya revocado o no pertenece a este usuario.' 
            });
        }

        res.status(200).send({ 
            message: 'Alias de contacto revocado con éxito.',
            revokedAlias: alias
        });

    } catch (error) {
        console.error("Error al revocar llave:", error);
        // Envía el error 500 al manejador global
        next(error); 
    }
});

// GET /api/keys/status/:alias (Controlador usando next)
router.get('/status/:alias', async (req, res, next) => { // Incluye 'next'
    const { alias } = req.params; 

    if (!alias) {
        return res.status(400).send({ error: 'Alias no proporcionado.' });
    }

    try {
        const keyMapping = await keyService.getKeyStatus(alias);

        if (!keyMapping) {
            return res.status(404).send({ message: 'Alias no encontrado.' });
        }

        return res.status(200).send({
            message: 'Estado de la llave consultado con éxito.',
            alias: keyMapping.alias,
            purpose: keyMapping.purpose,
            isActive: keyMapping.isActive 
        });

    } catch (error) {
        console.error("Error al consultar el estado de la llave:", error);
        // Envía el error 500 al manejador global
        next(error); 
    }
});

module.exports = router;