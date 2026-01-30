import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewDeciderAttributes {
  id: number;
  eventId: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  position?: string;
  institution?: string;
  department?: string;
  country?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewDeciderCreationAttributes
  extends Partial<AbstractReviewDeciderAttributes> {}

class AbstractReviewDeciders extends Model<
  AbstractReviewDeciderAttributes,
  AbstractReviewDeciderCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public title?: string;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public phone?: string;
  public position?: string;
  public institution?: string;
  public department?: string;
  public country?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviewDeciders(
  sequelize: Sequelize
): typeof AbstractReviewDeciders {
  AbstractReviewDeciders.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      firstName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: true },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      position: { type: DataTypes.STRING, allowNull: true },
      institution: { type: DataTypes.STRING, allowNull: true },
      department: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviewDeciders",
    }
  );

  return AbstractReviewDeciders;
}
