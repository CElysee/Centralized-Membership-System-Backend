import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import CompaniesController from './companies.controller';
import CompaniesService from './companies.service';
import Company from '../database/models/company.model';
import Member from '../database/models/member.model';
import Membership from '../database/models/membership.model';

@Module({
  imports: [SequelizeModule.forFeature([Company, Member, Membership])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export default class CompaniesModule {}


