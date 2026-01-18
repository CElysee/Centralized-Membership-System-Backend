import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
} from 'sequelize-typescript';
import User from './user.model';
import Association from './association.model';
import Member from './member.model';
import Company from './company.model';
import MembershipType from './membership-type.model';
import ApplicationStatusHistory from './application-status-history.model';
import Document from './document.model';
import { ApplicationStatus } from 'src/shared';



export enum ApplicationType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  RENEWAL = 'RENEWAL',
  UPGRADE = 'UPGRADE',
}

@Table({
  tableName: 'membership_applications',
  schema: 'Membership',
  timestamps: true,
})
export default class MembershipApplication extends Model<MembershipApplication> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare applicationNumber: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @ForeignKey(() => Member)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Link to Member record after approval',
  })
  declare memberId?: string;

  @ForeignKey(() => Association)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare associationId: string;

  @ForeignKey(() => MembershipType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare membershipTypeId: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'For corporate applications',
  })
  declare companyId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationType)),
    allowNull: false,
    defaultValue: ApplicationType.INDIVIDUAL,
  })
  declare applicationType: ApplicationType;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    defaultValue: ApplicationStatus.SUBMITTED,
  })
  declare status: ApplicationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare submittedAt: Date;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare reviewedBy: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare reviewedAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare reviewNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare rejectionReason: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare approvedBy: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare approvedAt: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Flexible personal data: gender, dateOfBirth, educationLevel, workingExperience, etc.',
  })
  declare personalData?: Record<string, any>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Company data: companyName, tin, companyType, employees, etc.',
  })
  declare companyData?: Record<string, any>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Address data: province, district, sector, cell, village, streetName, poBox',
  })
  declare addressData?: Record<string, any>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare applicationData?: Record<string, any>;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare documentIds?: string[];

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Member)
  declare member?: Member;

  @BelongsTo(() => Association)
  declare association: Association;

  @BelongsTo(() => MembershipType)
  declare membershipType: MembershipType;

  @BelongsTo(() => Company)
  declare company?: Company;

  @HasMany(() => ApplicationStatusHistory)
  declare statusHistory: ApplicationStatusHistory[];

  @HasMany(() => Document)
  declare documents: Document[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}


