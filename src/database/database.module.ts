import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import all models
import User from './models/user.model';
import Otp from './models/otp.model';
import Role from './models/role.model';
import UserRole from './models/user-role.model';
import Association from './models/association.model';
import Member from './models/member.model';
import Company from './models/company.model';
import MembershipType from './models/membership-type.model';
import Membership from './models/membership.model';
import Document from './models/document.model';
import MembershipApplication from './models/membership-application.model';
import ApplicationStatusHistory from './models/application-status-history.model';

/**
 * Database module.
 * Configures Sequelize ORM with PostgreSQL
 */
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('DB_HOST');
        const username = configService.get('DB_USERNAME');
        const password = configService.get('DB_PASSWORD');
        const database = configService.get('DATABASE_NAME');
        const dialect = configService.get('DB_DRIVER') as any;

        return {
          dialect,
          host,
          username,
          password,
          database,
          autoLoadModels: true,
          synchronize: false, // Use migrations instead
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
        };
      },
    }),
    SequelizeModule.forFeature([
      User,
      Otp,
      Role,
      UserRole,
      Association,
      Company,
      Member,
      MembershipType,
      Membership,
      Document,
      MembershipApplication,
      ApplicationStatusHistory,
    ]),
  ],
  exports: [SequelizeModule],
})
class DatabaseModule {}

export default DatabaseModule;
