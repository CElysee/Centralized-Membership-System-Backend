import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import DocumentsController from './documents.controller';
import DocumentsService from './documents.service';
import Document from '../database/models/document.model';
import User from '../database/models/user.model';
import MembershipApplication from '../database/models/membership-application.model';

@Module({
  imports: [SequelizeModule.forFeature([Document, User, MembershipApplication])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export default class DocumentsModule {}


