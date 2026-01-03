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
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  schema: 'Authentication',
  timestamps: true,
})
export default class User extends Model<User> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
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
    type: DataType.STRING,
    defaultValue: null,
  })
  declare confirmationToken?: string;

  @Column({
    type: DataType.DATE,
    defaultValue: null,
  })
  declare confirmationSentAt?: Date;

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
    type: DataType.STRING,
    defaultValue: null,
  })
  declare resetToken?: string;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare resetEmailToken?: string;

  @Column({
    type: DataType.STRING,
    defaultValue: null,
  })
  declare resetEmail?: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  static setConfirmationToken(instance: User) {
    instance.confirmationToken = randomUUID();
    instance.confirmationSentAt = new Date();
  }
}


