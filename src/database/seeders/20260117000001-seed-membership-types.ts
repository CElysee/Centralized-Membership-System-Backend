import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

/**
 * Seed membership types for different associations
 * Based on legacy RSGA and RHTEA structures
 */
export default {
  async up(queryInterface: QueryInterface) {
    // First, get existing associations
    const associations = await queryInterface.sequelize.query(
      `SELECT id, code FROM "Membership"."associations"`) as Array<{ id: string; code: string }>;

    const membershipTypes: any[] = [];

    // For each association, create membership types
    for (const association of associations) {
      // Individual Member Type
      membershipTypes.push({
        id: randomUUID(),
        associationId: association.id,
        name: 'Individual Member',
        code: `${association.code}_IND`,
        description: 'Individual membership for professionals',
        annualFee: 50000.00,
        registrationFee: 25000.00,
        renewalPeriodMonths: 12,
        benefits: JSON.stringify([
          'Access to association events',
          'Networking opportunities',
          'Professional development resources',
          'Voting rights in general assembly',
        ]),
        requiredDocuments: JSON.stringify([
          { type: 'NATIONAL_ID', required: true, applicableTo: 'BOTH' },
          { type: 'PASSPORT', required: false, applicableTo: 'BOTH' },
          { type: 'CV_RESUME', required: true, applicableTo: 'INDIVIDUAL' },
          { type: 'ACADEMIC_CERTIFICATE', required: true, applicableTo: 'INDIVIDUAL' },
          { type: 'PROFESSIONAL_CERTIFICATE', required: false, applicableTo: 'INDIVIDUAL' },
          { type: 'PHOTO', required: true, applicableTo: 'BOTH' },
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Corporate Member Type - Silver
      membershipTypes.push({
        id: randomUUID(),
        associationId: association.id,
        name: 'Corporate Member - Silver',
        code: `${association.code}_CORP_SILVER`,
        description: 'Corporate membership for small to medium businesses',
        annualFee: 200000.00,
        registrationFee: 100000.00,
        renewalPeriodMonths: 12,
        benefits: JSON.stringify([
          'Company listing in directory',
          'Access to business networking events',
          'Representation in policy advocacy',
          'Training opportunities for staff',
        ]),
        requiredDocuments: JSON.stringify([
          { type: 'COMPANY_REGISTRATION_CERTIFICATE', required: true, applicableTo: 'CORPORATE' },
          { type: 'RDB_CERTIFICATE', required: true, applicableTo: 'CORPORATE' },
          { type: 'TAX_CLEARANCE', required: true, applicableTo: 'CORPORATE' },
          { type: 'BUSINESS_LICENSE', required: true, applicableTo: 'CORPORATE' },
          { type: 'RECOMMENDATION_LETTER', required: false, applicableTo: 'CORPORATE' },
          { type: 'NATIONAL_ID', required: true, applicableTo: 'BOTH' },
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Corporate Member Type - Gold
      membershipTypes.push({
        id: randomUUID(),
        associationId: association.id,
        name: 'Corporate Member - Gold',
        code: `${association.code}_CORP_GOLD`,
        description: 'Premium corporate membership for large enterprises',
        annualFee: 500000.00,
        registrationFee: 250000.00,
        renewalPeriodMonths: 12,
        benefits: JSON.stringify([
          'All Silver benefits',
          'Priority listing in directory',
          'Exclusive access to executive forums',
          'Representation on board committees',
          'Complimentary event sponsorship opportunities',
        ]),
        requiredDocuments: JSON.stringify([
          { type: 'COMPANY_REGISTRATION_CERTIFICATE', required: true, applicableTo: 'CORPORATE' },
          { type: 'RDB_CERTIFICATE', required: true, applicableTo: 'CORPORATE' },
          { type: 'TAX_CLEARANCE', required: true, applicableTo: 'CORPORATE' },
          { type: 'BUSINESS_LICENSE', required: true, applicableTo: 'CORPORATE' },
          { type: 'RECOMMENDATION_LETTER', required: false, applicableTo: 'CORPORATE' },
          { type: 'NATIONAL_ID', required: true, applicableTo: 'BOTH' },
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Honorary Member Type
      membershipTypes.push({
        id: randomUUID(),
        associationId: association.id,
        name: 'Honorary Member',
        code: `${association.code}_HONORARY`,
        description: 'Honorary membership for distinguished individuals',
        annualFee: 0.00,
        registrationFee: 0.00,
        renewalPeriodMonths: 12,
        benefits: JSON.stringify([
          'Lifetime recognition',
          'Access to all events',
          'Advisory role opportunities',
        ]),
        requiredDocuments: JSON.stringify([
          { type: 'NATIONAL_ID', required: true, applicableTo: 'BOTH' },
          { type: 'RECOMMENDATION_LETTER', required: true, applicableTo: 'BOTH' },
        ]),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Insert all membership types
    if (membershipTypes.length > 0) {
      await queryInterface.bulkInsert(
        { tableName: 'membership_types', schema: 'Membership' },
        membershipTypes,
      );
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete(
      { tableName: 'membership_types', schema: 'Membership' },
      {},
    );
  },
};


