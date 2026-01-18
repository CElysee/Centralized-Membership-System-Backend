import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Association, { AssociationStatus, AssociationType } from '../database/models/association.model';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import LoggerService from '../logger/logger.service';

@Injectable()
export default class AssociationsService {
  private readonly logger = new LoggerService('AssociationsService');

  constructor(
    @InjectModel(Association)
    private associationModel: typeof Association,
  ) {}

  /**
   * Create a new association
   */
  async create(createDto: CreateAssociationDto): Promise<Association> {
    this.logger.info('Creating association', { name: createDto.name, code: createDto.code });

    // Check if code already exists
    const existing = await this.associationModel.findOne({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException(`Association with code '${createDto.code}' already exists`);
    }

    const association = await this.associationModel.create(createDto as any);

    this.logger.info('Association created successfully', { id: association.id });
    this.logger.audit('ASSOCIATION_CREATED', {
      resourceId: association.id,
      resourceType: 'Association',
      status: 'SUCCESS',
    });

    return association;
  }

  /**
   * Get all associations
   */
  async findAll(status?: AssociationStatus, type?: AssociationType): Promise<Association[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    return this.associationModel.findAll({
      where,
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get associations in lite mode (minimal data for dropdown/selection)
   * Can be accessed by all authenticated users including members
   */
  async findLite(type?: AssociationType): Promise<Pick<Association, 'id' | 'name' | 'code' | 'logoUrl' | 'type'>[]> {
    const where: any = { status: AssociationStatus.ACTIVE };
    if (type) {
      where.type = type;
    }

    return this.associationModel.findAll({
      where,
      attributes: ['id', 'name', 'code', 'logoUrl', 'type'],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get association by ID
   */
  async findOne(id: string): Promise<Association> {
    const association = await this.associationModel.findByPk(id);

    if (!association) {
      throw new NotFoundException(`Association with ID '${id}' not found`);
    }

    return association;
  }

  /**
   * Get association by code
   */
  async findByCode(code: string): Promise<Association> {
    const association = await this.associationModel.findOne({
      where: { code },
    });

    if (!association) {
      throw new NotFoundException(`Association with code '${code}' not found`);
    }

    return association;
  }

  /**
   * Update association
   */
  async update(id: string, updateDto: UpdateAssociationDto): Promise<Association> {
    const association = await this.findOne(id);

    // If updating code, check for duplicates
    if (updateDto.code && updateDto.code !== association.code) {
      const existing = await this.associationModel.findOne({
        where: { code: updateDto.code },
      });

      if (existing) {
        throw new ConflictException(`Association with code '${updateDto.code}' already exists`);
      }
    }

    await association.update(updateDto);

    this.logger.info('Association updated', { id: association.id });
    this.logger.audit('ASSOCIATION_UPDATED', {
      resourceId: association.id,
      resourceType: 'Association',
      status: 'SUCCESS',
    });

    return association;
  }

  /**
   * Delete association (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<{ message: string }> {
    const association = await this.findOne(id);

    await association.update({ status: AssociationStatus.INACTIVE });

    this.logger.info('Association deactivated', { id: association.id });
    this.logger.audit('ASSOCIATION_DELETED', {
      resourceId: association.id,
      resourceType: 'Association',
      status: 'SUCCESS',
    });

    return { message: 'Association deactivated successfully' };
  }

  /**
   * Get association statistics
   */
  async getStatistics(id: string): Promise<any> {
    const association = await this.findOne(id);

    // TODO: Add counts for members, applications, etc.
    return {
      id: association.id,
      name: association.name,
      status: association.status,
      // memberCount: await this.getMemberCount(id),
      // pendingApplications: await this.getPendingApplicationsCount(id),
    };
  }
}

