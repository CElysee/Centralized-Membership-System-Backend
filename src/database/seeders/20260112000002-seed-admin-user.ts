'use strict';

import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Create admin user
    const adminUserId = randomUUID();
    const hashedPassword = await bcrypt.hash('Admin@123!', 12);

    await queryInterface.bulkInsert(
      { tableName: 'users', schema: 'Authentication' },
      [
        {
          id: adminUserId,
          fullName: 'System Administrator',
          email: 'admin@cms.local',
          phoneNumber: '+250788000000',
          password: hashedPassword,
          isActive: true,
          status: 'ACTIVE',
          loginCount: 0,
          twoFaSecurity: false,
          otpApproved: true,
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    );

    // Get the SYSTEM_ADMIN role ID
    const [roles]: any = await queryInterface.sequelize.query(
      `SELECT id FROM "Authentication"."roles" WHERE name = 'SYSTEM_ADMIN' LIMIT 1`,
    );

    if (roles && roles.length > 0) {
      // Assign SYSTEM_ADMIN role to admin user
      await queryInterface.bulkInsert(
        { tableName: 'user_roles', schema: 'Authentication' },
        [
          {
            id: randomUUID(),
            userId: adminUserId,
            roleId: roles[0].id,
            createdAt: new Date(),
          },
        ],
      );
    }

    console.log('\n========================================');
    console.log('Default Admin User Created:');
    console.log('Email: admin@cms.local');
    console.log('Password: Admin@123!');
    console.log('========================================\n');
  },

  async down(queryInterface: QueryInterface) {
    // First delete user roles
    await queryInterface.sequelize.query(`
      DELETE FROM "Authentication"."user_roles" 
      WHERE "userId" IN (
        SELECT id FROM "Authentication"."users" WHERE email = 'admin@cms.local'
      )
    `);

    // Then delete the user
    await queryInterface.bulkDelete(
      { tableName: 'users', schema: 'Authentication' },
      { email: 'admin@cms.local' },
    );
  },
};


