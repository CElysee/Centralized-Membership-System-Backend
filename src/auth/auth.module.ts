import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';

import AuthService from './auth.service';
import AuthController from './auth.controller';

// Models
import User from '../database/models/user.model';
import Role from '../database/models/role.model';
import UserRole from '../database/models/user-role.model';
import Association from '../database/models/association.model';
import Member from '../database/models/member.model';
import Company from '../database/models/company.model';
import MembershipType from '../database/models/membership-type.model';
import Document from '../database/models/document.model';
import MembershipApplication from '../database/models/membership-application.model';
import ApplicationStatusHistory from '../database/models/application-status-history.model';

import EmailService from '../email/email.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      UserRole,
      Association,
      Member,
      Company,
      MembershipType,
      Document,
      MembershipApplication,
      ApplicationStatusHistory,
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, ConfigService],
  exports: [AuthService],
})
export default class AuthModule {}
