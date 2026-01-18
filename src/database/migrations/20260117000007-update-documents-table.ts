import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    // Add applicationId column
    await queryInterface.addColumn(
      { tableName: 'documents', schema: 'Membership' },
      'applicationId',
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: { tableName: 'membership_applications', schema: 'Membership' },
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    );

    // Add new document types to enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "Membership"."enum_documents_documentType" 
      ADD VALUE IF NOT EXISTS 'COMPANY_REGISTRATION_CERTIFICATE'
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "Membership"."enum_documents_documentType" 
      ADD VALUE IF NOT EXISTS 'TAX_CLEARANCE'
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "Membership"."enum_documents_documentType" 
      ADD VALUE IF NOT EXISTS 'RDB_CERTIFICATE'
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "Membership"."enum_documents_documentType" 
      ADD VALUE IF NOT EXISTS 'BUSINESS_LICENSE'
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "Membership"."enum_documents_documentType" 
      ADD VALUE IF NOT EXISTS 'RECOMMENDATION_LETTER'
    `);

    // Add index
    await queryInterface.addIndex(
      { tableName: 'documents', schema: 'Membership' },
      ['applicationId'],
      { name: 'documents_application_id_idx' },
    );
  },

  async down(queryInterface: QueryInterface) {
    // Remove index
    await queryInterface.removeIndex(
      { tableName: 'documents', schema: 'Membership' },
      'documents_application_id_idx',
    );

    // Remove column
    await queryInterface.removeColumn(
      { tableName: 'documents', schema: 'Membership' },
      'applicationId',
    );

    // Note: Cannot remove enum values in PostgreSQL, they remain but unused
  },
};


