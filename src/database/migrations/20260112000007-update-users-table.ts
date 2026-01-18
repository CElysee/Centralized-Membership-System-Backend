'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Add new columns to users table
    const tableInfo = { tableName: 'users', schema: 'Authentication' };

    // Add status column
    await queryInterface.addColumn(tableInfo, 'status', {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'),
      defaultValue: 'PENDING_VERIFICATION',
    });

    // Add profile fields
    await queryInterface.addColumn(tableInfo, 'profilePictureUrl', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'dateOfBirth', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'nationalId', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'address', {
      type: DataTypes.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'city', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'country', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'emailVerifiedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'phoneVerifiedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn(tableInfo, 'resetTokenExpiresAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface: QueryInterface) {
    const tableInfo = { tableName: 'users', schema: 'Authentication' };

    await queryInterface.removeColumn(tableInfo, 'status');
    await queryInterface.removeColumn(tableInfo, 'profilePictureUrl');
    await queryInterface.removeColumn(tableInfo, 'dateOfBirth');
    await queryInterface.removeColumn(tableInfo, 'nationalId');
    await queryInterface.removeColumn(tableInfo, 'address');
    await queryInterface.removeColumn(tableInfo, 'city');
    await queryInterface.removeColumn(tableInfo, 'country');
    await queryInterface.removeColumn(tableInfo, 'emailVerifiedAt');
    await queryInterface.removeColumn(tableInfo, 'phoneVerifiedAt');
    await queryInterface.removeColumn(tableInfo, 'resetTokenExpiresAt');
  },
};


