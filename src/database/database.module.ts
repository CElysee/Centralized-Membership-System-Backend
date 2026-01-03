import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import User from './models/user.model';
/**
 * Database module.
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
          autoLoadModels: true, // autoLoadModels enabled
        };
      },
    }),
    SequelizeModule.forFeature([
      User
    ]),
  ],
  exports: [SequelizeModule],
})
class DatabaseModule {}

export default DatabaseModule;
