import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn(
      { tableName: 'associations', schema: 'Membership' },
      'type',
      {
        type: DataTypes.ENUM('INDIVIDUAL', 'CORPORATE', 'BOTH'),
        allowNull: false,
        defaultValue: 'BOTH',
        comment: 'Type of members this association accepts',
      },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn(
      { tableName: 'associations', schema: 'Membership' },
      'type',
    );
    // Drop enum type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "Membership"."enum_associations_type";',
    );
  },
};


