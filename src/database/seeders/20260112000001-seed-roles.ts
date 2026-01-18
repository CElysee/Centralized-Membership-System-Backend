'use strict';

import { QueryInterface } from 'sequelize';
import { randomUUID } from 'crypto';

const roles = [
  {
    id: randomUUID(),
    name: 'SYSTEM_ADMIN',
    displayName: 'System Administrator',
    description: 'Full system access with all permissions. Can manage all aspects of the system including users, associations, and settings.',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'ASSOCIATION_MANAGER',
    displayName: 'Association Manager',
    description: 'Manages membership applications, members, and association settings. Can approve or reject applications.',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'FINANCE_OFFICER',
    displayName: 'Finance Officer',
    description: 'Manages payments, invoices, and financial reports. Can process payments and generate receipts.',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'MEMBER',
    displayName: 'Member',
    description: 'Standard member role. Can view profile, membership status, and access member benefits.',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: randomUUID(),
    name: 'USER',
    displayName: 'User',
    description: 'Default user role. Basic access to view public information.',
    isActive: true,
    isSystemRole: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'roles', schema: 'Authentication' },
      roles,
    );
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete(
      { tableName: 'roles', schema: 'Authentication' },
      {
        name: ['SYSTEM_ADMIN', 'ASSOCIATION_MANAGER', 'FINANCE_OFFICER', 'MEMBER', 'USER'],
      },
    );
  },
};


