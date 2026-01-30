import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmitterAttributes {
  id: number;
  eventId: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobilePhone?: string;
  officePhone?: string;
  position?: string;
  institution?: string;
  department?: string;
  country?: string;
  address?: string;
  abstractSubmitted?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractSubmitterCreationAttributes
  extends Partial<AbstractSubmitterAttributes> {}

class AbstractSubmitters extends Model<
  AbstractSubmitterAttributes,
  AbstractSubmitterCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public title?: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public mobilePhone?: string;
  public officePhone?: string;
  public position?: string;
  public institution?: string;
  public department?: string;
  public country?: string;
  public address?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmitters(
  sequelize: Sequelize
): typeof AbstractSubmitters {
  AbstractSubmitters.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      firstName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false },
      mobilePhone: { type: DataTypes.STRING, allowNull: true },
      officePhone: { type: DataTypes.STRING, allowNull: true },
      position: { type: DataTypes.STRING, allowNull: true },
      institution: { type: DataTypes.STRING, allowNull: true },
      department: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmitters",
    }
  );

  return AbstractSubmitters;
}
