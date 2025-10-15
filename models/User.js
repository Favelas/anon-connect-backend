const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Importamos la instancia de conexión

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'users', // Nombre real de la tabla en la DB
    timestamps: true,
});

module.exports = User;