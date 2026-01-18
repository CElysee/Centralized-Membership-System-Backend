import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable(
      { tableName: 'application_status_history', schema: 'Membership' },
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        applicationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: { tableName: 'membership_applications', schema: 'Membership' },
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        previousStatus: {
          type: DataTypes.ENUM(
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'PENDING_DOCUMENTS',
            'PENDING_PAYMENT',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
          ),
          allowNull: true,
        },
        newStatus: {
          type: DataTypes.ENUM(
            'DRAFT',
            'SUBMITTED',
            'UNDER_REVIEW',
            'PENDING_DOCUMENTS',
            'PENDING_PAYMENT',
            'APPROVED',
            'REJECTED',
            'CANCELLED',
          ),
          allowNull: false,
        },
        changedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: { tableName: 'users', schema: 'Authentication' },
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        changedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
    );

    // Add indexes
    await queryInterface.addIndex(
      { tableName: 'application_status_history', schema: 'Membership' },
      ['applicationId'],
      { name: 'application_status_history_application_id_idx' },
    );

    await queryInterface.addIndex(
      { tableName: 'application_status_history', schema: 'Membership' },
      ['changedAt'],
      { name: 'application_status_history_changed_at_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({ tableName: 'application_status_history', schema: 'Membership' });
  },
};


