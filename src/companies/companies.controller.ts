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
import CompaniesService from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../shared/decorators/roles.decorator';
import { RoleType } from '../database/models/role.model';
import { CompanyStatus } from '../database/models/company.model';
import ResponseCommon from '../common/response.common';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export default class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create company',
    description: 'Create a new company. Accessible by System Admin and Association Manager.',
  })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - Company TIN already exists' })
  async create(@Body() createDto: CreateCompanyDto, @Res() res: Response) {
    const company = await this.companiesService.create(createDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.CREATED,
      'Company created successfully',
      res,
      company,
    );
  }

  @Get()
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER, RoleType.FINANCE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all companies',
    description: 'Retrieve all companies. Accessible by System Admin, Association Manager, and Finance Officer.',
  })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async findAll(
    @Query('status') status: CompanyStatus,
    @Res() res: Response,
  ) {
    const companies = await this.companiesService.findAll(status);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Companies retrieved successfully',
      res,
      companies,
    );
  }

  @Get(':id')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER, RoleType.FINANCE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get company by ID',
    description: 'Retrieve a specific company with employees and memberships.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const company = await this.companiesService.findOne(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Company retrieved successfully',
      res,
      company,
    );
  }

  @Get('tin/:tin')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get company by TIN',
    description: 'Retrieve company by Tax Identification Number.',
  })
  @ApiParam({ name: 'tin', description: 'Tax Identification Number' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByTin(@Param('tin') tin: string, @Res() res: Response) {
    const company = await this.companiesService.findByTin(tin);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Company retrieved successfully',
      res,
      company,
    );
  }

  @Put(':id')
  @Roles(RoleType.SYSTEM_ADMIN, RoleType.ASSOCIATION_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update company',
    description: 'Update company details. Accessible by System Admin and Association Manager.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateCompanyDto,
    @Res() res: Response,
  ) {
    const company = await this.companiesService.update(id, updateDto);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Company updated successfully',
      res,
      company,
    );
  }

  @Delete(':id')
  @Roles(RoleType.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Delete company',
    description: 'Soft delete company (set status to INACTIVE). Only accessible by System Admin.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const result = await this.companiesService.remove(id);
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
    summary: 'Get company statistics',
    description: 'Get statistics for company including employees and memberships.',
  })
  @ApiParam({ name: 'id', description: 'Company UUID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const stats = await this.companiesService.getStatistics(id);
    return ResponseCommon.handleSuccess(
      HttpStatus.OK,
      'Statistics retrieved successfully',
      res,
      stats,
    );
  }
}


