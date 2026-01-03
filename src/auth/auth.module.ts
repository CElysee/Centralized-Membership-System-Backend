import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import AuthService from './auth.service';
import AuthController from './auth.controller';
import User from '../database/models/user.model';
import EmailService from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, ConfigService],
  exports: [AuthService],
})
export default class AuthModule {}
