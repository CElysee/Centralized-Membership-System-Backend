import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration to change token columns from VARCHAR(255) to TEXT
 * JWT tokens are typically longer than 255 characters
 */
export default {
  async up(queryInterface: QueryInterface) {
    // Change confirmationToken to TEXT
    await queryInterface.changeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'confirmationToken',
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    );

    // Change resetToken to TEXT as well (for password reset)
    await queryInterface.changeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'resetToken',
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    );
  },

  async down(queryInterface: QueryInterface) {
    // Revert to VARCHAR(255)
    await queryInterface.changeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'confirmationToken',
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
    );

    await queryInterface.changeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'resetToken',
      {
        type: DataTypes.STRING,
        allowNull: true,
      },
    );
  },
};


