import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmissionFormCustomQuestionConfigAttributes {
  id: number;
  eventId: string;
  customQuestionId: number;
  questionType: "single-select" | "multiple-select" | "text";
  replyCharLimit?: number;
  choices?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

class AbstractSubmissionFormCustomQuestionConfig
  extends Model<AbstractSubmissionFormCustomQuestionConfigAttributes>
  implements AbstractSubmissionFormCustomQuestionConfigAttributes
{
  public id!: number;
  public eventId!: string;
  public customQuestionId!: number;
  public questionType!: "single-select" | "multiple-select" | "text";
  public replyCharLimit?: number;
  public choices?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmissionFormCustomQuestionConfig(
  sequelize: Sequelize
): typeof AbstractSubmissionFormCustomQuestionConfig {
  AbstractSubmissionFormCustomQuestionConfig.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      customQuestionId: { type: DataTypes.INTEGER, allowNull: false },
      questionType: {
        type: DataTypes.ENUM("single-select", "multiple-select", "text"),
        allowNull: false,
      },
      replyCharLimit: { type: DataTypes.INTEGER, allowNull: true },
      choices: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmissionFormCustomQuestionConfigs",
    }
  );

  return AbstractSubmissionFormCustomQuestionConfig;
}
