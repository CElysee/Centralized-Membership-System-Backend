import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn(
      { tableName: 'users', schema: 'Authentication' },
      'emailVerified',
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'users', schema: 'Authentication' },
      'phoneVerified',
      {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    );

    // Update existing users where emailVerifiedAt or phoneVerifiedAt is not null
    await queryInterface.sequelize.query(`
      UPDATE "Authentication"."users" 
      SET "emailVerified" = true 
      WHERE "emailVerifiedAt" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Authentication"."users" 
      SET "phoneVerified" = true 
      WHERE "phoneVerifiedAt" IS NOT NULL;
    `);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'emailVerified',
    );

    await queryInterface.removeColumn(
      { tableName: 'users', schema: 'Authentication' },
      'phoneVerified',
    );
  },
};



