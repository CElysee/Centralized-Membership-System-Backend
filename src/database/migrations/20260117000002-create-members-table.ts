import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(
      { tableName: 'members', schema: 'Membership' },
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: { tableName: 'users', schema: 'Authentication' },
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        memberNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        nationalId: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        passportNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        dateOfBirth: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'),
          allowNull: true,
        },
        educationLevel: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        workingExperience: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        specialization: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        biography: {
          type: DataTypes.TEXT,
          allowNull: true,
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
        position: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        addressData: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        memberType: {
          type: DataTypes.ENUM('INDIVIDUAL', 'CORPORATE', 'HONORARY', 'LIFETIME'),
          defaultValue: 'INDIVIDUAL',
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED'),
          defaultValue: 'PENDING',
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
      { tableName: 'members', schema: 'Membership' },
      ['userId'],
      { name: 'members_user_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'members', schema: 'Membership' },
      ['memberNumber'],
      { name: 'members_member_number_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'members', schema: 'Membership' },
      ['nationalId'],
      { name: 'members_national_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'members', schema: 'Membership' },
      ['status'],
      { name: 'members_status_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'members', schema: 'Membership' },
      ['companyId'],
      { name: 'members_company_id_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({ tableName: 'members', schema: 'Membership' });
  },
};


