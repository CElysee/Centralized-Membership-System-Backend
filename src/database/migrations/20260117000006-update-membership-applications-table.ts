import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    // Add new columns to membership_applications table
    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'memberId',
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: { tableName: 'members', schema: 'Membership' },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membershipTypeId',
      {
        type: DataTypes.UUID,
        allowNull: true, // Will be required after data migration
        references: {
          model: { tableName: 'membership_types', schema: 'Membership' },
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'companyId',
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: { tableName: 'companies', schema: 'Membership' },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'applicationType',
      {
        type: DataTypes.ENUM('INDIVIDUAL', 'CORPORATE', 'RENEWAL', 'UPGRADE'),
        allowNull: false,
        defaultValue: 'INDIVIDUAL',
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'personalData',
      {
        type: DataTypes.JSON,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'companyData',
      {
        type: DataTypes.JSON,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'addressData',
      {
        type: DataTypes.JSON,
        allowNull: true,
      },
    );

    // Add indexes
    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['memberId'],
      { name: 'membership_applications_member_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['membershipTypeId'],
      { name: 'membership_applications_membership_type_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['companyId'],
      { name: 'membership_applications_company_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['applicationType'],
      { name: 'membership_applications_application_type_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    // Remove indexes
    await queryInterface.removeIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membership_applications_member_id_idx',
    );
    await queryInterface.removeIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membership_applications_membership_type_id_idx',
    );
    await queryInterface.removeIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membership_applications_company_id_idx',
    );
    await queryInterface.removeIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membership_applications_application_type_idx',
    );

    // Remove columns
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'addressData',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'companyData',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'personalData',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'applicationType',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'companyId',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'membershipTypeId',
    );
    await queryInterface.removeColumn(
      { tableName: 'membership_applications', schema: 'Membership' },
      'memberId',
    );
  },
};


