import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractSubmissionFormCustomQuestionAttributes {
  id: number;
  qid: string;
  eventId: string;
  question: string;
  replyCharLimit: number;
  order: number;
  title?: string;
  answer?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractSubmissionFormCustomQuestionCreationAttributes
  extends Partial<AbstractSubmissionFormCustomQuestionAttributes> {}

class AbstractSubmissionFormCustomQuestions extends Model<
  AbstractSubmissionFormCustomQuestionAttributes,
  AbstractSubmissionFormCustomQuestionCreationAttributes
> {
  public id!: number;
  public qid!: string;
  public eventId!: string;
  public question!: string;
  public replyCharLimit!: number;
  public order!: number;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractSubmissionFormCustomQuestions(
  sequelize: Sequelize
): typeof AbstractSubmissionFormCustomQuestions {
  AbstractSubmissionFormCustomQuestions.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      qid: { type: DataTypes.STRING, allowNull: false },
      eventId: { type: DataTypes.STRING, allowNull: false },
      question: { type: DataTypes.STRING, allowNull: false },
      replyCharLimit: { type: DataTypes.INTEGER, allowNull: false },
      order: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractSubmissionFormCustomQuestions",
    }
  );

  return AbstractSubmissionFormCustomQuestions;
}
