// __tests__/keyService.test.js

// 1. MOCKS: Simulación de dependencias (DB, Crypto y QR)
// ----------------------------------------------------

// Simulamos el Modelo KeyMapping de Sequelize (la DB)
jest.mock('../models/KeyMapping', () => ({
  create: jest.fn(data => ({ 
        alias: data.alias,
        purpose: data.purpose,
        qrImage: 'FAKE_QR_IMAGE_DATA', // El QR se genera ANTES y se guarda aquí
        // ... otros campos
    })),
    update: jest.fn(),
    findOne: jest.fn(),
}));

// Simulamos la generación de bytes aleatorios (crypto) para tener un alias predecible
jest.mock('crypto', () => ({
    randomBytes: jest.fn(() => ({
        toString: jest.fn(() => 'FAKE_ALIAS_HASH'), // Alias fijo para la prueba
    })),
}));

// Simulamos el generador de QR (qrcode) para evitar crear archivos físicos
jest.mock('qrcode', () => ({
    // toDataURL usa un callback, simulamos que lo llama con un resultado fijo
    toDataURL: jest.fn().mockResolvedValue('FAKE_QR_IMAGE_DATA'),
}));

// ----------------------------------------------------

const { generateKey, revokeKey, getKeyStatus } = require('../services/keyService');
const KeyMapping = require('../models/KeyMapping');

describe('keyService: Pruebas de Lógica de Llaves', () => {
    
    // Limpiamos los Mocks (contadores de llamadas) antes de cada prueba para aislar
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- 1. Prueba de generateKey ---
    describe('generateKey', () => {
        test('1. Debe generar alias, QR y llamar a create con isActive: true', async () => {
            // 2. EJECUCIÓN
            const userId = 5;
            const purpose = 'Uso de prueba';
            
            const result = await generateKey(userId, purpose);

            // 3. VERIFICACIÓN (Assertion de la Salida)
            // Verificamos que los helpers devolvieron el valor esperado
            expect(result.alias).toBe('FAKE_ALIAS_HASH');
            expect(result.qrImage).toBe('FAKE_QR_IMAGE_DATA');
            
            // 4. VERIFICACIÓN DEL MOCK (Efectos Secundarios en la DB)
            // Verificamos que se llamó a la función create del Modelo
            expect(KeyMapping.create).toHaveBeenCalledTimes(1);
            
            // Verificamos que se llamó con los datos CORRECTOS y isActive: true
            expect(KeyMapping.create).toHaveBeenCalledWith({
                alias: 'FAKE_ALIAS_HASH',
                userId: userId,
                purpose: purpose,
                isActive: true, 
                 qrImage: 'FAKE_QR_IMAGE_DATA',
            });
        });
    });

    // --- 2. Prueba de revokeKey ---
    describe('revokeKey', () => {
        test('2. Debe devolver 1 si la revocación es exitosa (dueño y alias coinciden)', async () => {
            // 1. MOCK: Le decimos a KeyMapping.update que devuelva [1] (1 fila actualizada)
            KeyMapping.update.mockResolvedValue([1]);

            // 2. EJECUCIÓN
            const updatedRows = await revokeKey(5, 'alias_activo');

            // 3. VERIFICACIÓN (Assertion de la Salida)
            expect(updatedRows).toBe(1);
            
            // 4. VERIFICACIÓN DEL MOCK: Se llamó con los filtros correctos (userId y isActive: true)
            expect(KeyMapping.update).toHaveBeenCalledWith(
                { isActive: false },
                {
                    where: {
                        alias: 'alias_activo',
                        userId: 5,
                        isActive: true, // Solo revoca si estaba activo
                    },
                }
            );
        });

        test('3. Debe devolver 0 si el alias no pertenece al usuario o ya está inactivo', async () => {
            // 1. MOCK: Le decimos a KeyMapping.update que devuelva [0] (0 filas actualizadas)
            KeyMapping.update.mockResolvedValue([0]);

            // 2. EJECUCIÓN
            const updatedRows = await revokeKey(999, 'alias_ajeno'); // Intentando revocar algo que no es mío

            // 3. VERIFICACIÓN (Assertion de la Salida)
            expect(updatedRows).toBe(0);
        });
    });

    // --- 3. Prueba de getKeyStatus ---
    describe('getKeyStatus', () => {
        const mockKey = { alias: 'test_key', purpose: 'Test', isActive: true };

        test('4. Debe devolver el objeto del alias si es encontrado', async () => {
            // 1. MOCK: findOne devuelve el objeto simulado
            KeyMapping.findOne.mockResolvedValue(mockKey);

            // 2. EJECUCIÓN
            const result = await getKeyStatus('test_key');

            // 3. VERIFICACIÓN (Assertion de la Salida)
            expect(result).toEqual(mockKey);
            
            // 4. VERIFICACIÓN DEL MOCK: Asegurar que se buscó por el alias
            expect(KeyMapping.findOne).toHaveBeenCalledWith({ where: { alias: 'test_key' } });
        });

        test('5. Debe devolver null si el alias no existe', async () => {
            // 1. MOCK: findOne devuelve null
            KeyMapping.findOne.mockResolvedValue(null);

            // 2. EJECUCIÓN
            const result = await getKeyStatus('non_existent');

            // 3. VERIFICACIÓN (Assertion de la Salida)
            expect(result).toBeNull();
        });
    });
});