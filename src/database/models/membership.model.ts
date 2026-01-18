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
  BeforeCreate,
} from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import Member from './member.model';
import Company from './company.model';
import Association from './association.model';
import MembershipType from './membership-type.model';

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  PENDING_RENEWAL = 'PENDING_RENEWAL',
}

@Table({
  tableName: 'memberships',
  schema: 'Membership',
  timestamps: true,
})
export default class Membership extends Model<Membership> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare membershipNumber: string;

  @ForeignKey(() => Member)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare memberId: string;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'For corporate memberships',
  })
  declare companyId?: string;

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

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiryDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastRenewalDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare nextRenewalDate?: Date;

  @Column({
    type: DataType.ENUM(...Object.values(MembershipStatus)),
    defaultValue: MembershipStatus.ACTIVE,
  })
  declare status: MembershipStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare feePaid: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare autoRenew: boolean;

  @BelongsTo(() => Member)
  declare member: Member;

  @BelongsTo(() => Company)
  declare company?: Company;

  @BelongsTo(() => Association)
  declare association: Association;

  @BelongsTo(() => MembershipType)
  declare membershipType: MembershipType;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  static async generateMembershipNumber(instance: Membership) {
    if (!instance.membershipNumber) {
      // Generate membership number: MBR-YYYYMMDD-XXXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      instance.membershipNumber = `MBR-${year}${month}${day}-${random}`;
    }
  }
}


