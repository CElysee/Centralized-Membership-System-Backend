'use strict';

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'user_roles',
        schema: 'Authentication',
      },
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'users',
              schema: 'Authentication',
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        roleId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'roles',
              schema: 'Authentication',
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        assignedBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn('NOW'),
        },
      },
    );

    // Create unique constraint for user-role combination
    await queryInterface.addIndex(
      { tableName: 'user_roles', schema: 'Authentication' },
      ['userId', 'roleId'],
      { name: 'idx_user_roles_unique', unique: true },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({
      tableName: 'user_roles',
      schema: 'Authentication',
    });
  },
};


