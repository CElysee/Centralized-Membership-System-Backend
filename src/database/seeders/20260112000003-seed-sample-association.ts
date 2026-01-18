'use strict';

import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'associations', schema: 'Membership' },
      [
        {
          id: randomUUID(),
          name: 'Rwanda Professional Association',
          code: 'RPA',
          description: 'A professional association for various professionals in Rwanda.',
          email: 'info@rpa.rw',
          phone: '+250788111111',
          address: 'KG 123 Street, Kigali, Rwanda',
          website: 'https://rpa.rw',
          status: 'ACTIVE',
          settings: JSON.stringify({
            requireDocuments: ['NATIONAL_ID', 'PROFESSIONAL_CERTIFICATE'],
            membershipFee: 50000,
            currency: 'RWF',
          }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: randomUUID(),
          name: 'Rwanda Engineers Society',
          code: 'RES',
          description: 'Professional body for engineers in Rwanda.',
          email: 'info@res.rw',
          phone: '+250788222222',
          address: 'KN 456 Avenue, Kigali, Rwanda',
          website: 'https://res.rw',
          status: 'ACTIVE',
          settings: JSON.stringify({
            requireDocuments: ['NATIONAL_ID', 'ACADEMIC_CERTIFICATE', 'PROFESSIONAL_CERTIFICATE'],
            membershipFee: 100000,
            currency: 'RWF',
          }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    );

    console.log('\n========================================');
    console.log('Sample Associations Created:');
    console.log('1. Rwanda Professional Association (RPA)');
    console.log('2. Rwanda Engineers Society (RES)');
    console.log('========================================\n');
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete(
      { tableName: 'associations', schema: 'Membership' },
      {
        code: ['RPA', 'RES'],
      },
    );
  },
};


