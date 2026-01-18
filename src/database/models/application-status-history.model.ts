import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import MembershipApplication from './membership-application.model';
import User from './user.model';
import { ApplicationStatus } from 'src/shared';

@Table({
  tableName: 'application_status_history',
  schema: 'Membership',
  timestamps: false,
})
export default class ApplicationStatusHistory extends Model<ApplicationStatusHistory> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MembershipApplication)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare applicationId: string;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    allowNull: true,
  })
  declare previousStatus?: ApplicationStatus;

  @Column({
    type: DataType.ENUM(...Object.values(ApplicationStatus)),
    allowNull: false,
  })
  declare newStatus: ApplicationStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'User who made the status change',
  })
  declare changedBy?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare changedAt: Date;

  @BelongsTo(() => MembershipApplication)
  declare application: MembershipApplication;

  @BelongsTo(() => User)
  declare user?: User;
}


