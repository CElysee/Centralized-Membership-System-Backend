import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import DatabaseModule from './database/database.module';
import LoggerModule from './logger/logger.module';
import AuthModule from './auth/auth.module';
import FilesModule from './files/files.module';
import RolesModule from './roles/roles.module';
import UsersModule from './users/users.module';
import EmailModule from './email/email.module';

import AssociationsModule from './associations/associations.module';
import CompaniesModule from './companies/companies.module';
import DocumentsModule from './documents/documents.module';
import ApplicationsModule from './applications/applications.module';
import MorganMiddleware from './middlewares/morgan.middleware';

// Shared utilities

import { GlobalExceptionFilter } from './shared/filters';
import { JwtAuthGuard, RolesGuard } from './shared/guards';
import {
  CorrelationInterceptor,
  LoggingInterceptor,
  ResponseTransformInterceptor,
} from './shared/interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
    LoggerModule,
    DatabaseModule,
    EmailModule,
    AuthModule,
    FilesModule,
    RolesModule,
    UsersModule,
    AssociationsModule,
    CompaniesModule,
    DocumentsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global Interceptors (order matters - executed in reverse order)
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
