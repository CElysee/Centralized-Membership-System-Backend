'use strict';

import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable(
      {
        tableName: 'documents',
        schema: 'Membership',
      },
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
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
        documentType: {
          type: DataTypes.ENUM(
            'NATIONAL_ID',
            'PASSPORT',
            'DRIVING_LICENSE',
            'PROOF_OF_ADDRESS',
            'PROFESSIONAL_CERTIFICATE',
            'ACADEMIC_CERTIFICATE',
            'CV_RESUME',
            'PHOTO',
            'OTHER',
          ),
          allowNull: false,
        },
        fileName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        originalName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        filePath: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mimeType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fileSize: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'),
          defaultValue: 'PENDING',
        },
        expiryDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        rejectionReason: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        verifiedBy: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        verifiedAt: {
          type: DataTypes.DATE,
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
      { tableName: 'documents', schema: 'Membership' },
      ['userId'],
      { name: 'idx_documents_user_id' },
    );

    await queryInterface.addIndex(
      { tableName: 'documents', schema: 'Membership' },
      ['documentType'],
      { name: 'idx_documents_type' },
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable({
      tableName: 'documents',
      schema: 'Membership',
    });
  },
};


