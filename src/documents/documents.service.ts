import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Document, { DocumentStatus } from '../database/models/document.model';
import User from '../database/models/user.model';
import MembershipApplication from '../database/models/membership-application.model';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import LoggerService from '../logger/logger.service';

@Injectable()
export default class DocumentsService {
  private readonly logger = new LoggerService('DocumentsService');

  constructor(
    @InjectModel(Document)
    private documentModel: typeof Document,
  ) {}

  /**
   * Get all documents (with filters)
   */
  async findAll(filters: {
    userId?: string;
    applicationId?: string;
    status?: DocumentStatus;
  }): Promise<Document[]> {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.applicationId) where.applicationId = filters.applicationId;
    if (filters.status) where.status = filters.status;

    return this.documentModel.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: MembershipApplication,
          attributes: ['id', 'applicationNumber', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get document by ID
   */
  async findOne(id: string): Promise<Document> {
    const document = await this.documentModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: MembershipApplication,
          attributes: ['id', 'applicationNumber', 'status'],
        },
      ],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID '${id}' not found`);
    }

    return document;
  }

  /**
   * Get user's documents
   */
  async findByUserId(userId: string): Promise<Document[]> {
    return this.documentModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get application's documents
   */
  async findByApplicationId(applicationId: string): Promise<Document[]> {
    return this.documentModel.findAll({
      where: { applicationId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Update document status (verify/reject)
   */
  async updateStatus(
    id: string,
    updateDto: UpdateDocumentStatusDto,
    verifiedByUserId: string,
  ): Promise<Document> {
    const document = await this.findOne(id);

    // Validate rejection reason
    if (updateDto.status === DocumentStatus.REJECTED && !updateDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a document');
    }

    await document.update({
      status: updateDto.status,
      rejectionReason: updateDto.rejectionReason,
      verifiedBy: updateDto.status === DocumentStatus.VERIFIED ? verifiedByUserId : undefined,
      verifiedAt: updateDto.status === DocumentStatus.VERIFIED ? new Date() : undefined,
    });

    this.logger.info('Document status updated', { 
      id: document.id, 
      status: updateDto.status,
      verifiedBy: verifiedByUserId,
    });
    
    this.logger.audit('DOCUMENT_STATUS_UPDATED', {
      resourceId: document.id,
      resourceType: 'Document',
      status: 'SUCCESS',
      metadata: { newStatus: updateDto.status, verifiedBy: verifiedByUserId },
    });

    return document;
  }

  /**
   * Delete document
   */
  async remove(id: string, requestingUserId: string): Promise<{ message: string }> {
    const document = await this.findOne(id);

    // Only the document owner can delete (unless admin)
    // This check should be done in controller with proper role verification

    await document.destroy();

    this.logger.info('Document deleted', { id: document.id, deletedBy: requestingUserId });
    this.logger.audit('DOCUMENT_DELETED', {
      resourceId: document.id,
      resourceType: 'Document',
      status: 'SUCCESS',
      metadata: { deletedBy: requestingUserId },
    });

    return { message: 'Document deleted successfully' };
  }

  /**
   * Get documents pending verification
   */
  async findPendingVerification(): Promise<Document[]> {
    return this.documentModel.findAll({
      where: { status: DocumentStatus.PENDING },
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: MembershipApplication,
          attributes: ['id', 'applicationNumber', 'status', 'associationId'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Get document statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.documentModel.count();
    const pending = await this.documentModel.count({ where: { status: DocumentStatus.PENDING } });
    const verified = await this.documentModel.count({ where: { status: DocumentStatus.VERIFIED } });
    const rejected = await this.documentModel.count({ where: { status: DocumentStatus.REJECTED } });

    return {
      total,
      pending,
      verified,
      rejected,
      verificationRate: total > 0 ? ((verified / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}


