'use strict';

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'roles',
        schema: 'Authentication',
      },
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        displayName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        isSystemRole: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn('NOW'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn('NOW'),
        },
      },
    );

    // Create index on name
    await queryInterface.addIndex(
      { tableName: 'roles', schema: 'Authentication' },
      ['name'],
      { name: 'idx_roles_name', unique: true },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({
      tableName: 'roles',
      schema: 'Authentication',
    });
  },
};


