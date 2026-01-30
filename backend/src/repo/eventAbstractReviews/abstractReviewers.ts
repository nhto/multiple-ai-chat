import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewerAttributes {
  id: number;
  eventId: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  officePhone?: string;
  mobilePhone?: string;
  position?: string;
  institution?: string;
  department?: string;
  country?: string;
  topicId?: number;
  abstractNumber: number;
  topic?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewerCreationAttributes
  extends Partial<AbstractReviewerAttributes> {}

class AbstractReviewers extends Model<
  AbstractReviewerAttributes,
  AbstractReviewerCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public title?: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public officePhone?: string;
  public mobilePhone?: string;
  public position?: string;
  public institution?: string;
  public department?: string;
  public country?: string;
  public topicId?: number;
  public abstractNumber!: number;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviewers(
  sequelize: Sequelize
): typeof AbstractReviewers {
  AbstractReviewers.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      firstName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false },
      officePhone: { type: DataTypes.STRING, allowNull: true },
      mobilePhone: { type: DataTypes.STRING, allowNull: true },
      position: { type: DataTypes.STRING, allowNull: true },
      institution: { type: DataTypes.STRING, allowNull: true },
      department: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      topicId: { type: DataTypes.INTEGER, allowNull: true },
      abstractNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviewers",
    }
  );

  return AbstractReviewers;
}
