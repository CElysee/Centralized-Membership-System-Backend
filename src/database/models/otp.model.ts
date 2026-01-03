import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  Index,
  AllowNull,
} from 'sequelize-typescript';

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOGIN_VERIFICATION = 'LOGIN_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
}

export enum OtpStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
}

@Table({
  tableName: 'otps',
  schema: 'Authentication',
  timestamps: true,
})
export default class Otp extends Model<Otp> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING(6))
  code: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(OtpType)))
  type: OtpType;

  @AllowNull(false)
  @Default(OtpStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(OtpStatus)))
  status: OtpStatus;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  verifiedAt: Date;

  @AllowNull(true)
  @Column(DataType.STRING)
  userAgent: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  ipAddress: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  attempts: number;

  @AllowNull(false)
  @Default(3)
  @Column(DataType.INTEGER)
  maxAttempts: number;

  @AllowNull(true)
  @Column(DataType.JSON)
  metadata: object;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isVerified(): boolean {
    return this.status === OtpStatus.VERIFIED;
  }

  get isUsed(): boolean {
    return this.status === OtpStatus.USED;
  }

  get canVerify(): boolean {
    return this.status === OtpStatus.PENDING && !this.isExpired && this.attempts < this.maxAttempts;
  }
}
