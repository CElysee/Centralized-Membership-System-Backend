import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import AssociationsController from './associations.controller';
import AssociationsService from './associations.service';
import Association from '../database/models/association.model';

@Module({
  imports: [SequelizeModule.forFeature([Association])],
  controllers: [AssociationsController],
  providers: [AssociationsService],
  exports: [AssociationsService],
})
export default class AssociationsModule {}


