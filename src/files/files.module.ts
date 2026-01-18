import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import FilesController from './files.controller';
import FilesService from './files.service';

/**
 * Files Module - Proxy to File Server
 * Exposes endpoints to stream and get file information
 */
@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export default class FilesModule {}
