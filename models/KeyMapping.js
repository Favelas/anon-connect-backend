// models/KeyMapping.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KeyMapping = sequelize.define('KeyMapping', {
  alias: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true 
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false, 
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
    allowNull: false,
  }
}, {
  tableName: 'key_mappings' 
});

module.exports = KeyMapping;