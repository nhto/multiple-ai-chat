import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmissionPresentationModeOptionConfigAttributes {
  id: number;
  presentationModeId: number;
  eventId: string;
  isEnabled: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

class AbstractSubmissionPresentationModeOptionConfigs
  extends Model<AbstractSubmissionPresentationModeOptionConfigAttributes>
  implements AbstractSubmissionPresentationModeOptionConfigAttributes
{
  public id!: number;
  public presentationModeId!: number;
  public eventId!: string;
  public isEnabled!: boolean;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmissionPresentationModeOptionConfigs(
  sequelize: Sequelize
): typeof AbstractSubmissionPresentationModeOptionConfigs {
  AbstractSubmissionPresentationModeOptionConfigs.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      presentationModeId: { type: DataTypes.INTEGER, allowNull: false },
      eventId: { type: DataTypes.STRING, allowNull: false },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmissionPresentationModeOptionConfigs",
    }
  );

  return AbstractSubmissionPresentationModeOptionConfigs;
}
