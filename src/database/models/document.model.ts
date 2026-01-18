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
  Default,
} from 'sequelize-typescript';
import User from './user.model';

import MembershipApplication from './membership-application.model';

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
  PROFESSIONAL_CERTIFICATE = 'PROFESSIONAL_CERTIFICATE',
  ACADEMIC_CERTIFICATE = 'ACADEMIC_CERTIFICATE',
  CV_RESUME = 'CV_RESUME',
  PHOTO = 'PHOTO',
  COMPANY_REGISTRATION_CERTIFICATE = 'COMPANY_REGISTRATION_CERTIFICATE',
  TAX_CLEARANCE = 'TAX_CLEARANCE',
  RDB_CERTIFICATE = 'RDB_CERTIFICATE',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  RECOMMENDATION_LETTER = 'RECOMMENDATION_LETTER',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Table({
  tableName: 'documents',
  schema: 'Membership',
  timestamps: true,
})
export default class Document extends Model<Document> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @ForeignKey(() => MembershipApplication)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Links document to specific application',
  })
  declare applicationId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentType)),
    allowNull: false,
  })
  declare documentType: DocumentType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fileName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare originalName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare filePath: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mimeType: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare fileSize: number;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentStatus)),
    defaultValue: DocumentStatus.PENDING,
  })
  declare status: DocumentStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare expiryDate: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare rejectionReason: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare verifiedBy: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare verifiedAt: Date;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => MembershipApplication)
  declare application?: MembershipApplication;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}


