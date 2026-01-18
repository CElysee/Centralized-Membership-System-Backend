import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Add renewalFrequency column
    await queryInterface.addColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'renewalFrequency',
      {
        type: DataTypes.ENUM('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'BIENNIAL', 'LIFETIME'),
        allowNull: false,
        defaultValue: 'ANNUAL',
        comment: 'Renewal frequency',
      },
    );

    // Rename renewalPeriodMonths to validityMonths
    await queryInterface.renameColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'renewalPeriodMonths',
      'validityMonths',
    );

    // Update the comment on validityMonths
    await queryInterface.changeColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'validityMonths',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 12,
        comment: 'Validity period in months',
      },
    );
  },

  async down(queryInterface: QueryInterface) {
    // Rename validityMonths back to renewalPeriodMonths
    await queryInterface.renameColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'validityMonths',
      'renewalPeriodMonths',
    );

    // Update the comment back
    await queryInterface.changeColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'renewalPeriodMonths',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 12,
        comment: 'Renewal period in months',
      },
    );

    // Remove renewalFrequency column
    await queryInterface.removeColumn(
      { tableName: 'membership_types', schema: 'Membership' },
      'renewalFrequency',
    );

    // Drop enum type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "Membership"."enum_membership_types_renewalFrequency";',
    );
  },
};


