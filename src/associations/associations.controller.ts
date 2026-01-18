import {
  Controller,
  Get,
  Post,
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
import AssociationsService from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { RoleType } from '../database/models/role.model';
import { AssociationStatus, AssociationType } from '../database/models/association.model';
import ResponseCommon from '../common/response.common';
import { Public } from '../shared/decorators';

@ApiTags('Associations')
@ApiBearerAuth()
@Controller('associations')
export default class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post()
  @Roles(RoleType.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create association',
    description: 'Create a new association. Only accessible by System Admin.',
  })
  @ApiResponse({ status: 201, description: 'Association created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Association code already exists' })
  async create(@Body() createDto: CreateAssociationDto, @Res() res: Response) {
    const association = await this.associationsService.create(createDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'Association created successfully',
      res,
      association,
    );
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all associations',
    description: 'Retrieve all associations. Public endpoint.',
  })
  @ApiQuery({ name: 'status', required: false, enum: AssociationStatus })
  @ApiQuery({ name: 'type', required: false, enum: AssociationType })
  @ApiResponse({ status: 200, description: 'Associations retrieved successfully' })
  async findAll(
    @Query('status') status: AssociationStatus,
    @Query('type') type: AssociationType,
    @Res() res: Response,
  ) {
    const associations = await this.associationsService.findAll(status, type);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Associations retrieved successfully',
      res,
      associations,
    );
  }

  @Get('lite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get associations (lite mode)',
    description: 'Retrieve minimal association data for dropdowns/selection. Accessible by all authenticated users.',
  })
  @ApiQuery({ name: 'type', required: false, enum: AssociationType, description: 'Filter by association type' })
  @ApiResponse({ status: 200, description: 'Associations retrieved successfully' })
  async findLite(
    @Query('type') type: AssociationType,
    @Res() res: Response,
  ) {
    const associations = await this.associationsService.findLite(type);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Associations retrieved successfully',
      res,
      associations,
    );
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get association by ID',
    description: 'Retrieve a specific association. Public endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const association = await this.associationsService.findOne(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Association retrieved successfully',
      res,
      association,
    );
  }

  @Public()
  @Get('code/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get association by code',
    description: 'Retrieve association by unique code. Public endpoint.',
  })
  @ApiParam({ name: 'code', description: 'Association code (e.g., RHTA)' })
  @ApiResponse({ status: 200, description: 'Association retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async findByCode(@Param('code') code: string, @Res() res: Response) {
    const association = await this.associationsService.findByCode(code);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Association retrieved successfully',
      res,
      association,
    );
  }

  @Put(':id')
  @Roles(RoleType.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update association',
    description: 'Update association details. Only accessible by System Admin.',
  })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateAssociationDto,
    @Res() res: Response,
  ) {
    const association = await this.associationsService.update(id, updateDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Association updated successfully',
      res,
      association,
    );
  }

  @Delete(':id')
  @Roles(RoleType.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete association',
    description: 'Soft delete association (set status to INACTIVE). Only accessible by System Admin.',
  })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Association deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const result = await this.associationsService.remove(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      result.message,
      res,
      null,
    );
  }

  @Get(':id/statistics')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get association statistics',
    description: 'Get statistics for association. Accessible by System Admin and Association Manager.',
  })
  @ApiParam({ name: 'id', description: 'Association UUID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const stats = await this.associationsService.getStatistics(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Statistics retrieved successfully',
      res,
      stats,
    );
  }
}

