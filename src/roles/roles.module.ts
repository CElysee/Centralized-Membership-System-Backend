import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import RolesController from './roles.controller';
import RolesService from './roles.service';
import Role from '../database/models/role.model';
import LoggerModule from '../logger/logger.module';

@Module({
  imports: [SequelizeModule.forFeature([Role]), LoggerModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export default class RolesModule {}

