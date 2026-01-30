import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractCommentReceptionAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  deciderId: number;
  submitterId: number;
  submitterEnrollment: boolean;
  submitterNote: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractCommentReceptionCreationAttributes
  extends Partial<AbstractCommentReceptionAttributes> {}

class AbstractCommentReception extends Model<
AbstractCommentReceptionAttributes,
AbstractCommentReceptionCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public abstractId!: number;
  public deciderId!: number;
  public submitterId!: number;
  public submitterEnrollment!: boolean;
  public submitterNote!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractCommentReception(
  sequelize: Sequelize
): typeof AbstractCommentReception {
  AbstractCommentReception.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      abstractId: { type: DataTypes.INTEGER, allowNull: false },
      deciderId: { type: DataTypes.INTEGER, allowNull: false },
      submitterId: { type: DataTypes.INTEGER, allowNull: false },
      submitterEnrollment: { type: DataTypes.BOOLEAN, allowNull: false },
      submitterNote: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractCommentReception",
    }
  );

  return AbstractCommentReception;
}
