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
import Association from './association.model';
import Membership from './membership.model';

export enum RenewalFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  BIENNIAL = 'BIENNIAL',
  LIFETIME = 'LIFETIME',
}

@Table({
  tableName: 'membership_types',
  schema: 'Membership',
  timestamps: true,
})
export default class MembershipType extends Model<MembershipType> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Association)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare associationId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare annualFee: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare registrationFee: number;

  @Column({
    type: DataType.ENUM(...Object.values(RenewalFrequency)),
    allowNull: false,
    defaultValue: RenewalFrequency.ANNUAL,
    comment: 'Renewal frequency',
  })
  declare renewalFrequency: RenewalFrequency;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 12,
    comment: 'Validity period in months',
  })
  declare validityMonths: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Array of benefit descriptions',
  })
  declare benefits?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: 'Required documents configuration: [{"type": "NATIONAL_ID", "required": true, "applicableTo": "INDIVIDUAL"}]',
  })
  declare requiredDocuments?: Array<{
    type: string;
    required: boolean;
    applicableTo?: 'INDIVIDUAL' | 'CORPORATE' | 'BOTH';
  }>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @BelongsTo(() => Association)
  declare association: Association;

  @HasMany(() => Membership)
  declare memberships: Membership[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

