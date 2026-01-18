import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(
      { tableName: 'membership_types', schema: 'Membership' },
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        annualFee: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        registrationFee: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        renewalPeriodMonths: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 12,
        },
        benefits: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        requiredDocuments: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
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
      { tableName: 'membership_types', schema: 'Membership' },
      ['associationId'],
      { name: 'membership_types_association_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_types', schema: 'Membership' },
      ['code'],
      { name: 'membership_types_code_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_types', schema: 'Membership' },
      ['isActive'],
      { name: 'membership_types_is_active_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({ tableName: 'membership_types', schema: 'Membership' });
  },
};


