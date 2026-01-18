import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Default,
} from 'sequelize-typescript';
import Member from './member.model';
import Membership from './membership.model';

export enum CompanyType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
  LIMITED_LIABILITY = 'LIMITED_LIABILITY',
  CORPORATION = 'CORPORATION',
  COOPERATIVE = 'COOPERATIVE',
  NGO = 'NGO',
}

export enum OwnershipType {
  PRIVATE_LOCAL = 'PRIVATE_LOCAL',
  PRIVATE_FOREIGN = 'PRIVATE_FOREIGN',
  JOINT_VENTURE = 'JOINT_VENTURE',
  STATE_OWNED = 'STATE_OWNED',
  PUBLIC_PRIVATE_PARTNERSHIP = 'PUBLIC_PRIVATE_PARTNERSHIP',
  OTHER = 'OTHER',
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISSOLVED = 'DISSOLVED',
}

@Table({
  tableName: 'companies',
  schema: 'Membership',
  timestamps: true,
})
export default class Company extends Model<Company> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    comment: 'Tax Identification Number',
  })
  declare tin?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Business registration number',
  })
  declare registrationNumber?: string;

  @Column({
    type: DataType.ENUM(...Object.values(CompanyType)),
    allowNull: true,
  })
  declare companyType?: CompanyType;

  @Column({
    type: DataType.ENUM(...Object.values(OwnershipType)),
    allowNull: true,
  })
  declare ownershipType?: OwnershipType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Business activity sector/category',
  })
  declare activitySector?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logoUrl?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  declare permanentEmployees?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  declare partTimeEmployees?: number;

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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.ENUM(...Object.values(CompanyStatus)),
    defaultValue: CompanyStatus.ACTIVE,
  })
  declare status: CompanyStatus;

  @HasMany(() => Member)
  declare employees: Member[];

  @HasMany(() => Membership)
  declare memberships: Membership[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}


