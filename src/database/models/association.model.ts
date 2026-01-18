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

export enum AssociationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AssociationType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
  BOTH = 'BOTH',
}

@Table({
  tableName: 'associations',
  schema: 'Membership',
  timestamps: true,
})
export default class Association extends Model<Association> {
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
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logoUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare website: string;

  @Column({
    type: DataType.ENUM(...Object.values(AssociationStatus)),
    defaultValue: AssociationStatus.ACTIVE,
  })
  declare status: AssociationStatus;

  @Column({
    type: DataType.ENUM(...Object.values(AssociationType)),
    defaultValue: AssociationType.BOTH,
    comment: 'Type of members this association accepts',
  })
  declare type: AssociationType;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare settings: Record<string, any>;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}


