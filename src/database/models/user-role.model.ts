import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  CreatedAt,
  Default,
} from 'sequelize-typescript';
import User from './user.model';
import Role from './role.model';

@Table({
  tableName: 'user_roles',
  schema: 'Authentication',
  timestamps: true,
  updatedAt: false,
})
export default class UserRole extends Model<UserRole> {
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

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare roleId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare assignedBy: string;

  @CreatedAt
  declare createdAt: Date;
}


