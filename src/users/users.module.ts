import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import UsersController from './users.controller';
import UsersService from './users.service';
import User from '../database/models/user.model';
import Role from '../database/models/role.model';
import UserRole from '../database/models/user-role.model';
import LoggerModule from '../logger/logger.module';

@Module({
  imports: [SequelizeModule.forFeature([User, Role, UserRole]), LoggerModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export default class UsersModule {}

