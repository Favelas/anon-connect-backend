// services/keyService.js
const KeyMapping = require('../models/KeyMapping');
const crypto = require('crypto');
const QRCode = require('qrcode');

/**
 * Genera un nuevo alias, crea el QR y lo guarda en la base de datos.
 * @param {string} userId - El ID del usuario propietario (del token JWT).
 * @param {string} purpose - El propósito del alias.
 * @returns {object} Datos del nuevo alias (alias, purpose, qrImage).
 */
async function generateKey(userId, purpose) {
    // 1. Generar Alias y QR (Lógica de Negocio)
    const alias = crypto.randomBytes(32).toString('hex'); 
    const qrCodeData = `anonconnect://${alias}`; 
    const qrImage = await QRCode.toDataURL(qrCodeData);

    // 2. Mapear en la base de datos (Lógica de Datos)
    const newKey = await KeyMapping.create({
        alias: alias,
        purpose: purpose,
        qrImage: qrImage,
        userId: userId, // ID del dueño real
        isActive: true,
    });

    // 3. Devolver solo los datos que la API necesita
    return {
        alias: newKey.alias,
        purpose: newKey.purpose,
        qrImage: newKey.qrImage,
    };
}

/**
 * Revoca (desactiva) un alias si el usuario es el propietario.
 * @param {string} userId - El ID del usuario que intenta revocar (del token JWT).
 * @param {string} alias - El alias a revocar.
 * @returns {number} Número de filas afectadas (1 si fue exitoso, 0 si falló).
 */
async function revokeKey(userId, alias) {
    const [updatedRows] = await KeyMapping.update(
        { isActive: false },
        {
            where: {
                alias: alias,
                userId: userId, // Solo el dueño puede revocar
                isActive: true
            }
        }
    );
    return updatedRows;
}

/**
 * Consulta el estado de un alias.
 * @param {string} alias - El alias a consultar.
 * @returns {object|null} El mapeo de la llave o null si no se encuentra.
 */
async function getKeyStatus(alias) {
    return KeyMapping.findOne({ 
        where: { alias: alias } 
    });
}


module.exports = {
    generateKey,
    revokeKey,
    getKeyStatus,
};