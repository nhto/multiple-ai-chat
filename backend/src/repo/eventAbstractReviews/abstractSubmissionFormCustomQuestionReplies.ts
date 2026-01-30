import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmissionFormCustomQuestionReplyAttributes {
  id: number;
  eventId: string;
  submitterId: number;
  customQuestionId: number;
  reply: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractSubmissionFormCustomQuestionReplyCreationAttributes
  extends Partial<AbstractSubmissionFormCustomQuestionReplyAttributes> {}

class AbstractSubmissionFormCustomQuestionReplies extends Model<
  AbstractSubmissionFormCustomQuestionReplyAttributes,
  AbstractSubmissionFormCustomQuestionReplyCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public submitterId!: number;
  public customQuestionId!: number;
  public reply!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmissionFormCustomQuestionReplies(
  sequelize: Sequelize
): typeof AbstractSubmissionFormCustomQuestionReplies {
  AbstractSubmissionFormCustomQuestionReplies.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      submitterId: { type: DataTypes.INTEGER, allowNull: false },
      customQuestionId: { type: DataTypes.INTEGER, allowNull: false },
      reply: { type: DataTypes.STRING, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmissionFormCustomQuestionReplies",
    }
  );

  return AbstractSubmissionFormCustomQuestionReplies;
}
