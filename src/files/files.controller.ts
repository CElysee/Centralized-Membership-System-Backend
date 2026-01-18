import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';

import FilesService from './files.service';
import { Public } from 'src/shared/decorators';
import ResponseCommon from 'src/common/response.common';
import { GetFilesByIdsDto, MultipleFilesInfoDto } from './dto/file.dto';

@ApiTags('Files')
@Controller('files')
export default class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Stream file by ID (public endpoint for viewing)
   */
  @Public()
  @Get('stream/id/:id')
  @ApiOperation({
    summary: 'Stream file by ID',
    description: 'Stream file content directly from the file server (for viewing images, PDFs, etc.)',
  })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'File streamed successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async streamFileById(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.filesService.streamFileById(id, res);
  }

  /**
   * Stream file by filename (public endpoint for viewing)
   */
  @Public()
  @Get('stream/:fileName')
  @ApiOperation({
    summary: 'Stream file by filename',
    description: 'Stream file content by its stored filename from the file server',
  })
  @ApiParam({ name: 'fileName', description: 'Stored filename (e.g., uuid.pdf)' })
  @ApiResponse({ status: 200, description: 'File streamed successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async streamFileByName(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.filesService.streamFileByName(fileName, res);
  }

  /**
   * Get multiple files information by IDs
   */
  @Post('info/bulk')
  @ApiOperation({
    summary: 'Get multiple files information',
    description: 'Retrieve metadata for multiple files by their IDs from the file server',
  })
  @ApiBody({ type: GetFilesByIdsDto })
  @ApiResponse({ status: 200, description: 'Files information retrieved', type: MultipleFilesInfoDto })
  async getFilesByIds(
    @Body() dto: GetFilesByIdsDto,
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.filesService.getFilesByIds(dto.ids);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Files information retrieved',
      res,
      result.data || result,
    );
  }
}
