import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(
      { tableName: 'companies', schema: 'Membership' },
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tin: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        registrationNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        companyType: {
          type: DataTypes.ENUM(
            'SOLE_PROPRIETORSHIP',
            'PARTNERSHIP',
            'LIMITED_LIABILITY',
            'CORPORATION',
            'COOPERATIVE',
            'NGO',
          ),
          allowNull: true,
        },
        ownershipType: {
          type: DataTypes.ENUM(
            'PRIVATE_LOCAL',
            'PRIVATE_FOREIGN',
            'JOINT_VENTURE',
            'STATE_OWNED',
            'PUBLIC_PRIVATE_PARTNERSHIP',
            'OTHER',
          ),
          allowNull: true,
        },
        activitySector: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        website: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        logoUrl: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        permanentEmployees: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        partTimeEmployees: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        addressData: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISSOLVED'),
          defaultValue: 'ACTIVE',
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
      { tableName: 'companies', schema: 'Membership' },
      ['tin'],
      { name: 'companies_tin_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'companies', schema: 'Membership' },
      ['status'],
      { name: 'companies_status_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({ tableName: 'companies', schema: 'Membership' });
  },
};


