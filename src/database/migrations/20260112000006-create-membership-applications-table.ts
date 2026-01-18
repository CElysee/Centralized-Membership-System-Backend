'use strict';

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'membership_applications',
        schema: 'Membership',
      },
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        applicationNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'users',
              schema: 'Authentication',
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        associationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: {
              tableName: 'associations',
              schema: 'Membership',
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        status: {
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
          defaultValue: 'SUBMITTED',
        },
        submittedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        reviewedBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        reviewedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        reviewNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        rejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        approvedBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        approvedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        applicationData: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        documentIds: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn('NOW'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn('NOW'),
        },
      },
    );

    // Create indexes
    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['applicationNumber'],
      { name: 'idx_applications_number', unique: true },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['userId'],
      { name: 'idx_applications_user_id' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['associationId'],
      { name: 'idx_applications_association_id' },
    );

    await queryInterface.addIndex(
      { tableName: 'membership_applications', schema: 'Membership' },
      ['status'],
      { name: 'idx_applications_status' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({
      tableName: 'membership_applications',
      schema: 'Membership',
    });
  },
};


