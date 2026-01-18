import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import ApplicationsController from './applications.controller';
import ApplicationsService from './applications.service';
import MembershipApplication from '../database/models/membership-application.model';
import ApplicationStatusHistory from '../database/models/application-status-history.model';
import Member from '../database/models/member.model';
import Membership from '../database/models/membership.model';
import MembershipType from '../database/models/membership-type.model';
import User from '../database/models/user.model';
import Association from '../database/models/association.model';
import Company from '../database/models/company.model';
import Document from '../database/models/document.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      MembershipApplication,
      ApplicationStatusHistory,
      Member,
      Membership,
      MembershipType,
      User,
      Association,
      Company,
      Document,
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export default class ApplicationsModule {}


