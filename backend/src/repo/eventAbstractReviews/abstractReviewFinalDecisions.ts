import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewFinalDecisionAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  deciderId: number;
  comments: string;
  grades: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isUnderDiscussionWithSubmitter: boolean;
  isDraft?: boolean; // Optional and can be null
  suggestedPresentationMode?: string; // New field added
}

interface AbstractReviewFinalDecisionCreationAttributes
  extends Partial<AbstractReviewFinalDecisionAttributes> {}

class AbstractReviewFinalDecisions extends Model<
  AbstractReviewFinalDecisionAttributes,
  AbstractReviewFinalDecisionCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public abstractId!: number;
  public deciderId!: number;
  public comments!: string;
  public grades!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
  public isUnderDiscussionWithSubmitter?: boolean;
  public isDraft?: boolean;
  public suggestedPresentationMode?: string; // New field added
}

export function initAbstractReviewFinalDecisions(
  sequelize: Sequelize
): typeof AbstractReviewFinalDecisions {
  AbstractReviewFinalDecisions.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      abstractId: { type: DataTypes.INTEGER, allowNull: false },
      deciderId: { type: DataTypes.INTEGER, allowNull: false },
      comments: { type: DataTypes.STRING, allowNull: false },
      grades: { type: DataTypes.STRING, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
      isUnderDiscussionWithSubmitter: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      isDraft: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
      suggestedPresentationMode: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable field
        defaultValue: null, // Default value is null
      }, // New field added
    },
    {
      sequelize,
      tableName: "AbstractReviewFinalDecisions",
    }
  );

  return AbstractReviewFinalDecisions;
}
