import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewEmailTemplateAttributes {
  id: number;
  eventId: string;
  scenario: string;
  subject: string;
  content: string;
  scenarioString?: string;
  group?: string;
  bcc?: string; // New field added
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewEmailTemplateCreationAttributes
  extends Partial<AbstractReviewEmailTemplateAttributes> {}

class AbstractReviewEmailTemplates extends Model<
  AbstractReviewEmailTemplateAttributes,
  AbstractReviewEmailTemplateCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public scenario!: string;
  public subject!: string;
  public content!: string;
  public bcc?: string; // New field added
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviewEmailTemplates(
  sequelize: Sequelize
): typeof AbstractReviewEmailTemplates {
  AbstractReviewEmailTemplates.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      scenario: { type: DataTypes.STRING, allowNull: false },
      subject: { type: DataTypes.STRING, allowNull: false },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      bcc: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable field
        defaultValue: null, // Default value is null
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviewEmailTemplates",
    }
  );

  return AbstractReviewEmailTemplates;
}
