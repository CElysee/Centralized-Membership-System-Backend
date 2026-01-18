import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Company, { CompanyStatus } from '../database/models/company.model';
import Member from '../database/models/member.model';
import Membership from '../database/models/membership.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import LoggerService from '../logger/logger.service';

@Injectable()
export default class CompaniesService {
  private readonly logger = new LoggerService('CompaniesService');

  constructor(
    @InjectModel(Company)
    private companyModel: typeof Company,
  ) {}

  /**
   * Create a new company
   */
  async create(createDto: CreateCompanyDto): Promise<Company> {
    this.logger.info('Creating company', { name: createDto.name });

    // Check if TIN already exists
    if (createDto.tin) {
      const existing = await this.companyModel.findOne({
        where: { tin: createDto.tin },
      });

      if (existing) {
        throw new ConflictException(`Company with TIN '${createDto.tin}' already exists`);
      }
    }

    const company = await this.companyModel.create(createDto as any);

    this.logger.info('Company created successfully', { id: company.id });
    this.logger.audit('COMPANY_CREATED', {
      resourceId: company.id,
      resourceType: 'Company',
      status: 'SUCCESS',
    });

    return company;
  }

  /**
   * Get all companies
   */
  async findAll(status?: CompanyStatus): Promise<Company[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.companyModel.findAll({
      where,
      order: [['name', 'ASC']],
      include: [
        {
          model: Member,
          as: 'employees',
          attributes: ['id', 'memberNumber', 'position'],
        },
      ],
    });
  }

  /**
   * Get company by ID
   */
  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'employees',
          attributes: ['id', 'memberNumber', 'userId', 'position', 'status'],
        },
        {
          model: Membership,
          as: 'memberships',
          attributes: ['id', 'membershipNumber', 'status', 'startDate', 'expiryDate'],
        },
      ],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }

    return company;
  }

  /**
   * Get company by TIN
   */
  async findByTin(tin: string): Promise<Company> {
    const company = await this.companyModel.findOne({
      where: { tin },
    });

    if (!company) {
      throw new NotFoundException(`Company with TIN '${tin}' not found`);
    }

    return company;
  }

  /**
   * Update company
   */
  async update(id: string, updateDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    // If updating TIN, check for duplicates
    if (updateDto.tin && updateDto.tin !== company.tin) {
      const existing = await this.companyModel.findOne({
        where: { tin: updateDto.tin },
      });

      if (existing) {
        throw new ConflictException(`Company with TIN '${updateDto.tin}' already exists`);
      }
    }

    await company.update(updateDto);

    this.logger.info('Company updated', { id: company.id });
    this.logger.audit('COMPANY_UPDATED', {
      resourceId: company.id,
      resourceType: 'Company',
      status: 'SUCCESS',
    });

    return company;
  }

  /**
   * Delete company (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<{ message: string }> {
    const company = await this.findOne(id);

    await company.update({ status: CompanyStatus.INACTIVE });

    this.logger.info('Company deactivated', { id: company.id });
    this.logger.audit('COMPANY_DELETED', {
      resourceId: company.id,
      resourceType: 'Company',
      status: 'SUCCESS',
    });

    return { message: 'Company deactivated successfully' };
  }

  /**
   * Get company statistics
   */
  async getStatistics(id: string): Promise<any> {
    const company = await this.findOne(id);

    return {
      id: company.id,
      name: company.name,
      status: company.status,
      employeeCount: company.employees?.length || 0,
      activeMemberships: company.memberships?.filter(m => m.status === 'ACTIVE').length || 0,
      totalEmployees: (company.permanentEmployees || 0) + (company.partTimeEmployees || 0),
    };
  }
}


