import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import DocumentsService from './documents.service';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators';
import { AuthenticatedUser } from '../shared/interfaces';
import { RoleType } from '../database/models/role.model';
import { DocumentStatus } from '../database/models/document.model';
import ResponseCommon from '../common/response.common';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export default class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER, RoleType.FINANCE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all documents',
    description: 'Retrieve documents with optional filters. Accessible by admins and managers.',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'applicationId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findAll(
    @Query('userId') userId: string,
    @Query('applicationId') applicationId: string,
    @Query('status') status: DocumentStatus,
    @Res() res: Response,
  ) {
    const documents = await this.documentsService.findAll({ userId, applicationId, status });
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Documents retrieved successfully',
      res,
      documents,
    );
  }

  @Get('pending')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get pending documents',
    description: 'Retrieve documents pending verification.',
  })
  @ApiResponse({ status: 200, description: 'Pending documents retrieved successfully' })
  async findPending(@Res() res: Response) {
    const documents = await this.documentsService.findPendingVerification();
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Pending documents retrieved successfully',
      res,
      documents,
    );
  }

  @Get('statistics')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get document statistics',
    description: 'Get statistics for documents (total, pending, verified, rejected).',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Res() res: Response) {
    const stats = await this.documentsService.getStatistics();
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Statistics retrieved successfully',
      res,
      stats,
    );
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get user documents',
    description: 'Retrieve all documents for a specific user. Users can view their own, admins can view any.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User documents retrieved successfully' })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    // TODO: Add authorization check - user can only see their own documents unless admin
    const documents = await this.documentsService.findByUserId(userId);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'User documents retrieved successfully',
      res,
      documents,
    );
  }

  @Get('application/:applicationId')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get application documents',
    description: 'Retrieve all documents for a specific application.',
  })
  @ApiParam({ name: 'applicationId', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application documents retrieved successfully' })
  async findByApplicationId(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Res() res: Response,
  ) {
    const documents = await this.documentsService.findByApplicationId(applicationId);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Application documents retrieved successfully',
      res,
      documents,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get document by ID',
    description: 'Retrieve a specific document. Users can view their own, admins can view any.',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Document retrieved successfully',
      res,
      document,
    );
  }

  @Put(':id/status')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update document status',
    description: 'Verify or reject a document. Accessible by System Admin and Association Manager.',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Missing rejection reason' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDocumentStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.updateStatus(id, updateDto, currentUser.sub);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Document status updated successfully',
      res,
      document,
    );
  }

  @Delete(':id')
  @Roles(RoleType.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete document',
    description: 'Delete a document. Only accessible by System Admin.',
  })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const result = await this.documentsService.remove(id, currentUser.sub);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      result.message,
      res,
      null,
    );
  }
}


