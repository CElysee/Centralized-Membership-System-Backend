import { randomUUID } from 'crypto';
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BelongsToMany,
  HasMany,
  ForeignKey,
  Default,
} from 'sequelize-typescript';
import Role from './role.model';
import UserRole from './user-role.model';
import Document from './document.model';
import MembershipApplication from './membership-application.model';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  SUSPENDED = 'SUSPENDED',
}

@Table({
  tableName: 'users',
  schema: 'Authentication',
  timestamps: true,
})
export default class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare email?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    defaultValue: UserStatus.PENDING_VERIFICATION,
  })
  declare status: UserStatus;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive?: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare loginCount?: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare twoFaSecurity?: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare otpCode?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare otpApprovedAt?: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare otpSentAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare otpApproved?: boolean;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
  })
  declare confirmationToken?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare confirmationSentAt?: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare emailVerifiedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare emailVerified: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare phoneVerifiedAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare phoneVerified: boolean;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare lastSignedInIpAddress?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare lastSignedDate?: Date;

  @Column({
    type: DataType.TEXT,
    defaultValue: null,
  })
  declare resetToken?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare resetTokenExpiresAt?: Date;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare profilePictureUrl?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare dateOfBirth?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare nationalId?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare address?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare city?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare country?: string;

  // Relationships
  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];

  @HasMany(() => Document)
  declare documents: Document[];

  @HasMany(() => MembershipApplication)
  declare applications: MembershipApplication[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  static setConfirmationToken(instance: User) {
    instance.confirmationToken = randomUUID();
    instance.confirmationSentAt = new Date();
  }

  /**
   * Get role names as string array (for JWT payload)
   */
  getRoleNames(): string[] {
    return this.roles?.map((role) => role.name) || [];
  }
}
