import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmissionPresentationModeOptionsAttributes {
  id: number;
  mode: string;
  modeDisplayName: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

class AbstractSubmissionPresentationModeOptions
  extends Model<AbstractSubmissionPresentationModeOptionsAttributes>
  implements AbstractSubmissionPresentationModeOptionsAttributes
{
  public id!: number;
  public mode!: string;
  public modeDisplayName!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmissionPresentationModeOptions(
  sequelize: Sequelize
): typeof AbstractSubmissionPresentationModeOptions {
  AbstractSubmissionPresentationModeOptions.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      mode: { type: DataTypes.STRING, allowNull: false },
      modeDisplayName: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmissionPresentationModeOptions",
    }
  );

  return AbstractSubmissionPresentationModeOptions;
}
