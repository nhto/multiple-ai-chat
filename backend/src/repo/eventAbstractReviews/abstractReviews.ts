import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  reviewerId: number;
  comments?: string;
  grades?: string;
  isDraft?: number;
  reviewerTitle?: string;
  reviewerFirstName?: string;
  reviewerLastName?: string;
  reviewerEmail?: string;
  reviewerInstitution?: string;
  reviewerCountry?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewCreationAttributes
  extends Partial<AbstractReviewAttributes> {}

class AbstractReviews extends Model<
  AbstractReviewAttributes,
  AbstractReviewCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public abstractId!: number;
  public reviewerId!: number;
  public comments?: string;
  public grades?: string;
  public isDraft?: number;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviews(
  sequelize: Sequelize
): typeof AbstractReviews {
  AbstractReviews.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      abstractId: { type: DataTypes.INTEGER, allowNull: false },
      reviewerId: { type: DataTypes.INTEGER, allowNull: false },
      comments: { type: DataTypes.STRING, allowNull: true },
      grades: { type: DataTypes.STRING, allowNull: true },
      isDraft: { type: DataTypes.INTEGER, allowNull: true }, 
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviews",
      indexes: [
        {
          unique: true,
          fields: ['eventId', 'reviewerId', 'abstractId']
        }
      ]
    }
  );

  return AbstractReviews;
}
