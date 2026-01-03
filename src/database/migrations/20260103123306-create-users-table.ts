'use strict';

import { QueryInterface, Sequelize, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize:Sequelize) {

    await queryInterface.createTable(
      {
        tableName: 'users',
        schema: 'Authentication',
      },
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },

        fullName: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },

        phoneNumber: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },

        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },

        loginCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },

        twoFaSecurity: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },

        otpCode: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        otpApprovedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        otpSentAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        otpApproved: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },

        confirmationToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        confirmationSentAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        lastSignedInIpAddress: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        lastSignedDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        resetToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        resetEmailToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        resetEmail: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },

        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW'),
        },
      }
    );
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable({
      tableName: 'users',
      schema: 'Authentication',
    });
  },
};
