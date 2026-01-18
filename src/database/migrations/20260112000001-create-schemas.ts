'use strict';

import { QueryInterface } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    // Create schemas if they don't exist
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS "Authentication";');
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS "Membership";');
  },

  async down(queryInterface: QueryInterface) {
    // Don't drop schemas in down migration to prevent data loss
    // If needed, manually drop: DROP SCHEMA "Membership" CASCADE;
  },
};


