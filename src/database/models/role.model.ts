import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
  Default,
} from 'sequelize-typescript';
import User from './user.model';
import UserRole from './user-role.model';

/**
 * System roles enum
 */
export enum RoleType {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  ASSOCIATION_MANAGER = 'ASSOCIATION_MANAGER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  MEMBER = 'MEMBER',
  USER = 'USER',
}

@Table({
  tableName: 'roles',
  schema: 'Authentication',
  timestamps: true,
})
export default class Role extends Model<Role> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare displayName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isSystemRole: boolean;

  @BelongsToMany(() => User, () => UserRole)
  declare users: User[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}


