import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(
      { tableName: 'memberships', schema: 'Membership' },
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        membershipNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        memberId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'members', schema: 'Membership' },
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        companyId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: { tableName: 'companies', schema: 'Membership' },
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        associationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'associations', schema: 'Membership' },
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        membershipTypeId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'membership_types', schema: 'Membership' },
            key: 'id',
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        expiryDate: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        lastRenewalDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        nextRenewalDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED', 'CANCELLED', 'PENDING_RENEWAL'),
          defaultValue: 'ACTIVE',
        },
        feePaid: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        autoRenew: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
    );

    // Add indexes
    await queryInterface.addIndex(
      { tableName: 'memberships', schema: 'Membership' },
      ['membershipNumber'],
      { name: 'memberships_membership_number_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'memberships', schema: 'Membership' },
      ['memberId'],
      { name: 'memberships_member_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'memberships', schema: 'Membership' },
      ['associationId'],
      { name: 'memberships_association_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'memberships', schema: 'Membership' },
      ['status'],
      { name: 'memberships_status_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'memberships', schema: 'Membership' },
      ['expiryDate'],
      { name: 'memberships_expiry_date_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({ tableName: 'memberships', schema: 'Membership' });
  },
};


