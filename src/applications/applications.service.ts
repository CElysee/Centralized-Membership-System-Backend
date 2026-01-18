import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import MembershipApplication from '../database/models/membership-application.model';
import ApplicationStatusHistory from '../database/models/application-status-history.model';
import Member, { MemberStatus } from '../database/models/member.model';
import Membership, { MembershipStatus } from '../database/models/membership.model';
import MembershipType from '../database/models/membership-type.model';
import User from '../database/models/user.model';
import Association from '../database/models/association.model';
import Company from '../database/models/company.model';
import Document from '../database/models/document.model';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import LoggerService from '../logger/logger.service';
import { ApplicationStatus } from 'src/shared';
import { where } from 'sequelize';

@Injectable()
export default class ApplicationsService {
  private readonly logger = new LoggerService('ApplicationsService');

  constructor(
    @InjectModel(MembershipApplication)
    private applicationModel: typeof MembershipApplication,
    @InjectModel(ApplicationStatusHistory)
    private historyModel: typeof ApplicationStatusHistory,
    @InjectModel(Member)
    private memberModel: typeof Member,
    @InjectModel(Membership)
    private membershipModel: typeof Membership,
    @InjectModel(MembershipType)
    private membershipTypeModel: typeof MembershipType,
    private sequelize: Sequelize,
  ) { }

  /**
   * Get all applications with filters
   */
  async findAll(filters: {
    status?: ApplicationStatus;
    associationId?: string;
    userId?: string;
  }): Promise<MembershipApplication[]> {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.associationId) where.associationId = filters.associationId;
    if (filters.userId) where.userId = filters.userId;

    return this.applicationModel.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phoneNumber'],
        },
        {
          model: Member,
          attributes: ['id', 'memberNumber', 'status'],
        },
        {
          model: Association,
          attributes: ['id', 'name', 'code'],
        },
        {
          model: MembershipType,
          attributes: ['id', 'name', 'code'],
        },
        {
          model: Company,
          attributes: ['id', 'name', 'tin'],
        },
      ],
      order: [['submittedAt', 'DESC']],
    });
  }

  /**
   * Get application by ID
   */
  async findOne(id: string): Promise<MembershipApplication> {
    const application = await this.applicationModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phoneNumber'],
        },
        {
          model: Member,
          attributes: ['id', 'memberNumber', 'status'],
        },
        {
          model: Association,
          attributes: ['id', 'name', 'code'],
        },
        {
          model: MembershipType,
          attributes: ['id', 'name', 'code', 'annualFee', 'registrationFee'],
        },
        {
          model: Company,
          attributes: ['id', 'name', 'tin', 'companyType'],
        },
        {
          model: ApplicationStatusHistory,
          as: 'statusHistory',
          order: [['changedAt', 'DESC']],
        },
        {
          model: Document,
          as: 'documents',
        },
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID '${id}' not found`);
    }

    return application;
  }

  /**
   * Get application status history
   */
  async getHistory(id: string): Promise<ApplicationStatusHistory[]> {
    const application = await this.findOne(id);

    return this.historyModel.findAll({
      where: { applicationId: application.id },
      order: [['changedAt', 'DESC']],
    });
  }

  /**
   * Update application status
   */
  async updateStatus(
    id: string,
    updateDto: UpdateApplicationStatusDto,
    changedByUserId: string,
  ): Promise<MembershipApplication> {
    const transaction = await this.sequelize.transaction();

    try {
      const application = await this.findOne(id);

      // Validate status transition
      if (application.status === ApplicationStatus.APPROVED) {
        throw new BadRequestException('Cannot change status of already approved application');
      }

      if (application.status === ApplicationStatus.CANCELLED) {
        throw new BadRequestException('Cannot change status of cancelled application');
      }

      // Validate rejection reason
      if (updateDto.status === ApplicationStatus.REJECTED && !updateDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting an application');
      }

      const previousStatus = application.status;

      // Update application
      await application.update(
        {
          status: updateDto.status,
          reviewedBy: changedByUserId,
          reviewedAt: new Date(),
          rejectionReason: updateDto.rejectionReason,
          approvedBy: updateDto.status === ApplicationStatus.APPROVED ? changedByUserId : undefined,
          approvedAt: updateDto.status === ApplicationStatus.APPROVED ? new Date() : undefined,
        },
        { transaction },
      );

      // Create status history entry
      await this.historyModel.create(
        {
          applicationId: application.id,
          previousStatus,
          newStatus: updateDto.status,
          changedBy: changedByUserId,
          notes: updateDto.notes,
          changedAt: new Date(),
        } as any,
        { transaction },
      );

      // If approved, create membership and update member status
      if (updateDto.status === ApplicationStatus.APPROVED) {
        await this.createMembershipFromApplication(application, transaction);
      }

      await transaction.commit();

      this.logger.info('Application status updated', {
        id: application.id,
        previousStatus,
        newStatus: updateDto.status,
        changedBy: changedByUserId,
      });

      this.logger.audit('APPLICATION_STATUS_UPDATED', {
        resourceId: application.id,
        resourceType: 'MembershipApplication',
        status: 'SUCCESS',
        metadata: {
          previousStatus,
          newStatus: updateDto.status,
          changedBy: changedByUserId,
        },
      });

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to update application status', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Review application - approve or reject
   */
  async reviewApplication(
    id: string,
    action: 'APPROVE' | 'REJECT',
    reviewedByUserId: string,
    notes?: string,
    rejectionReason?: string,
  ): Promise<MembershipApplication> {
    const transaction = await this.sequelize.transaction();

    try {
      const application = await this.findOne(id);
      let applicationHistoryTracker: ApplicationStatusHistory | null;

      // Validate current status
      if (application.status === ApplicationStatus.APPROVED) {
        throw new BadRequestException('Application is already approved');
      }

      if (application.status === ApplicationStatus.CANCELLED) {
        throw new BadRequestException('Cannot review a cancelled application');
      }

      // Validate rejection reason
      if (action === 'REJECT' && !rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting an application');
      }

      const previousStatus = application.status;
      const newStatus = action === 'APPROVE' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;

      // Update application status
      await application.update(
        {
          status: newStatus,
          reviewedBy: reviewedByUserId,
          reviewedAt: new Date(),
          ...(action === 'APPROVE' && {
            approvedBy: reviewedByUserId,
            approvedAt: new Date(),
          }),
          ...(action === 'REJECT' && {
            rejectionReason,
          }),
        },
        { transaction },
      );

      // updat status history entry
      applicationHistoryTracker = await this.historyModel.findOne({
        where: {
          applicationId: application.id
        }
      })
      await applicationHistoryTracker?.update(

        {
          previousStatus,
          newStatus,
          changedBy: reviewedByUserId,
          notes: notes || (action === 'APPROVE' ? 'Application approved' : 'Application rejected'),
          changedAt: new Date(),
        } as any,
        { transaction },
      );

      // If approved, create membership and activate member
      if (action === 'APPROVE') {
        await this.createMembershipFromApplication(application, transaction);
      }

      await transaction.commit();

      this.logger.info(`Application ${action.toLowerCase()}ed successfully`, {
        id: application.id,
        previousStatus,
        action,
        reviewedBy: reviewedByUserId,
      });

      this.logger.audit(`APPLICATION_${action}ED`, {
        resourceId: application.id,
        resourceType: 'MembershipApplication',
        status: 'SUCCESS',
        metadata: {
          previousStatus,
          newStatus,
          reviewedBy: reviewedByUserId,
        },
      });

      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      this.logger.error(`Failed to ${action.toLowerCase()} application`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * Approve application directly (kept for backward compatibility)
   * @deprecated Use reviewApplication with action='APPROVE' instead
   */
  async approveApplication(
    id: string,
    approvedByUserId: string,
    notes?: string,
  ): Promise<MembershipApplication> {
    return this.reviewApplication(id, 'APPROVE', approvedByUserId, notes);
  }

  /**
   * Create membership and activate member (private helper)
   */
  private async createMembershipFromApplication(
    application: MembershipApplication,
    transaction: any,
  ): Promise<void> {
    // Get membership type to determine dates and fees
    const membershipType = await this.membershipTypeModel.findByPk(application.membershipTypeId, {
      transaction,
    });

    if (!membershipType) {
      throw new NotFoundException('Membership type not found');
    }

    // Update member status to ACTIVE
    if (application.memberId) {
      await this.memberModel.update(
        { status: MemberStatus.ACTIVE },
        { where: { id: application.memberId }, transaction },
      );
    }

    // Create membership record
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + membershipType.validityMonths);

    await this.membershipModel.create(
      {
        memberId: application.memberId,
        companyId: application.companyId,
        associationId: application.associationId,
        membershipTypeId: application.membershipTypeId,
        startDate,
        expiryDate,
        status: MembershipStatus.ACTIVE,
        feePaid: membershipType.registrationFee + membershipType.annualFee,
      } as any,
      { transaction },
    );

    this.logger.info('Membership created upon approval', {
      applicationId: application.id,
      memberId: application.memberId,
    });
  }

  /**
   * Get applications by status
   */
  async findByStatus(status: ApplicationStatus, associationId?: string): Promise<MembershipApplication[]> {
    const where: any = { status };

    if (associationId) {
      where.associationId = associationId;
    }

    return this.applicationModel.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phoneNumber'],
        },
        {
          model: Member,
          attributes: ['id', 'memberNumber', 'status'],
        },
        {
          model: Association,
          attributes: ['id', 'name', 'code'],
        },
        {
          model: MembershipType,
          attributes: ['id', 'name', 'code'],
        },
        {
          model: Company,
          attributes: ['id', 'name', 'tin'],
        },
      ],
      order: [['submittedAt', 'ASC']],
    });
  }

  /**
   * Get application statistics
   */
  async getStatistics(associationId?: string): Promise<any> {
    const where: any = {};
    if (associationId) where.associationId = associationId;

    const total = await this.applicationModel.count({ where });
    const pending = await this.applicationModel.count({
      where: { ...where, status: ApplicationStatus.SUBMITTED },
    });
    const approved = await this.applicationModel.count({
      where: { ...where, status: ApplicationStatus.APPROVED },
    });
    const rejected = await this.applicationModel.count({
      where: { ...where, status: ApplicationStatus.REJECTED },
    });
    const underReview = await this.applicationModel.count({
      where: { ...where, status: ApplicationStatus.UNDER_REVIEW },
    });

    return {
      total,
      pending,
      approved,
      rejected,
      underReview,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}

