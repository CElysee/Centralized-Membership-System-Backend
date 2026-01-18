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
  BeforeCreate,
} from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import User from './user.model';
import Company from './company.model';
import Membership from './membership.model';
import MembershipApplication from './membership-application.model';

export enum MemberType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  HONORARY = 'HONORARY',
  LIFETIME = 'LIFETIME',
}

export enum MemberStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

@Table({
  tableName: 'members',
  schema: 'Membership',
  timestamps: true,
})
export default class Member extends Model<Member> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare memberNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare nationalId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare passportNumber?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare dateOfBirth?: Date;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true,
  })
  declare gender?: Gender;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare educationLevel?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare workingExperience?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare specialization?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare biography?: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare companyId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare position?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Stores: province, district, sector, cell, village, streetName, poBox, specificLocation',
  })
  declare addressData?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    streetName?: string;
    poBox?: string;
    specificLocation?: string;
  };

  @Column({
    type: DataType.ENUM(...Object.values(MemberType)),
    defaultValue: MemberType.INDIVIDUAL,
  })
  declare memberType: MemberType;

  @Column({
    type: DataType.ENUM(...Object.values(MemberStatus)),
    defaultValue: MemberStatus.PENDING,
  })
  declare status: MemberStatus;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Company)
  declare company?: Company;

  @HasMany(() => Membership)
  declare memberships: Membership[];

  @HasMany(() => MembershipApplication)
  declare applications: MembershipApplication[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  static async generateMemberNumber(instance: Member) {
    if (!instance.memberNumber) {
      // Generate member number: MEM-YYYYMMDD-XXXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      instance.memberNumber = `MEM-${year}${month}${day}-${random}`;
    }
  }
}


