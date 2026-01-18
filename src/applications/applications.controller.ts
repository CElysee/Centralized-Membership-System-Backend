import {
  Controller,
  Get,
  Post,
  Put,
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
import ApplicationsService from './applications.service';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ReviewApplicationDto } from './dto/approve-application.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators';
import { AuthenticatedUser } from '../shared/interfaces';
import { RoleType } from '../database/models/role.model';
import ResponseCommon from '../common/response.common';
import { ApplicationStatus } from 'src/shared';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export default class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER, RoleType.FINANCE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all applications',
    description: 'Retrieve applications with optional filters. Accessible by admins and managers.',
  })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  async findAll(
    @Query('status') status: ApplicationStatus,
    @Query('associationId') associationId: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    const applications = await this.applicationsService.findAll({
      status,
      associationId,
      userId,
    });
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Applications retrieved successfully',
      res,
      applications,
    );
  }

  @Get('by-status/:status')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get applications by status',
    description: 'Retrieve applications filtered by status (e.g., SUBMITTED, UNDER_REVIEW, APPROVED, etc.).',
  })
  @ApiParam({ 
    name: 'status', 
    enum: ApplicationStatus,
    description: 'Application status to filter by',
  })
  @ApiQuery({ name: 'associationId', required: false, description: 'Filter by association ID' })
  @ApiResponse({ status: 200, description: 'Applications retrieved successfully' })
  async findByStatus(
    @Param('status') status: ApplicationStatus,
    @Query('associationId') associationId: string,
    @Res() res: Response,
  ) {
    const applications = await this.applicationsService.findByStatus(status, associationId);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      `Applications with status '${status}' retrieved successfully`,
      res,
      applications,
    );
  }

  @Get('statistics')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get application statistics',
    description: 'Get statistics for applications (total, pending, approved, rejected).',
  })
  @ApiQuery({ name: 'associationId', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(
    @Query('associationId') associationId: string,
    @Res() res: Response,
  ) {
    const stats = await this.applicationsService.getStatistics(associationId);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Statistics retrieved successfully',
      res,
      stats,
    );
  }

  @Get(':id')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER, RoleType.FINANCE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get application by ID',
    description: 'Retrieve a specific application with full details including documents and history.',
  })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const application = await this.applicationsService.findOne(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Application retrieved successfully',
      res,
      application,
    );
  }

  @Get(':id/history')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get application history',
    description: 'Retrieve status change history for an application.',
  })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const history = await this.applicationsService.getHistory(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Application history retrieved successfully',
      res,
      history,
    );
  }

  @Put(':id/status')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update application status',
    description: 'Change application status (approve, reject, etc.). Automatically creates membership on approval.',
  })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const application = await this.applicationsService.updateStatus(
      id,
      updateDto,
      currentUser.sub,
    );
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Application status updated successfully',
      res,
      application,
    );
  }

  @Post(':id/review')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Review application (approve or reject)',
    description: 'Review membership application - approve to create membership and activate member, or reject with reason.',
  })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application reviewed successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Application approved successfully',
        data: {
          id: 'uuid',
          status: 'APPROVED',
          approvedBy: 'admin-uuid',
          approvedAt: '2026-01-17T12:00:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Application already approved/cancelled or missing rejection reason' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async reviewApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: ReviewApplicationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const application = await this.applicationsService.reviewApplication(
      id,
      reviewDto.action,
      currentUser.sub,
      reviewDto.notes,
      reviewDto.rejectionReason,
    );
    
    const message = reviewDto.action === 'APPROVE' 
      ? 'Application approved successfully' 
      : 'Application rejected successfully';

    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      message,
      res,
      application,
    );
  }

  @Post(':id/approve')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Approve application (legacy)',
    description: 'Approve membership application directly. Creates membership record and activates member automatically. Use /review endpoint instead for more flexibility.',
    deprecated: true,
  })
  @ApiParam({ name: 'id', description: 'Application UUID' })
  @ApiResponse({ status: 200, description: 'Application approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Application already approved or invalid status' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: ReviewApplicationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const application = await this.applicationsService.approveApplication(
      id,
      currentUser.sub,
      reviewDto.notes,
    );
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Application approved successfully',
      res,
      application,
    );
  }
}

