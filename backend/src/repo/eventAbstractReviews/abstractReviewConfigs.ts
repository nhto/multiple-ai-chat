import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewConfigAttributes {
  id: number;
  eventId: string;
  reviewerPerAbstract: number;
  abstractPerSubmitter: number;
  allowSameInstitution: boolean;
  abstractPerTopic?: number;
  gradingMethod: string;
  abstractSubmissionStartDate: Date;
  abstractSubmissionEndDate: Date;
  abstractSubmissionEnabled: boolean;
  paperSubmissionEnabled: boolean;
  abstractSubmissionAcceptedUserType?: string;
  abstractDescriptionCharLimit?: number;
  abstractSubmissionPageTitle?: string;
  abstractSubmissionPageDescription?: string;
  paperSubmissionPageTitle?: string;
  paperSubmissionPageDescription?: string;
  abstractSubmissionFormVisibleFields?: string;
  abstractSubmissionFormMandatoryFields?: string;
  abstractSubmissionNotificationBccAddress?: string;
  paperSubmissionNotificationBccAddress?: string;
  abstractSubmissionNotificationContent?: string;
  paperSubmissionNotificationContent?: string;
  abstractReviewDeadline: Date; // New field added here
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewConfigCreationAttributes
  extends Partial<AbstractReviewConfigAttributes> {}

class AbstractReviewConfigs extends Model<
  AbstractReviewConfigAttributes,
  AbstractReviewConfigCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public reviewerPerAbstract!: number;
  public abstractPerSubmitter!: number;
  public allowSameInstitution!: boolean;
  public abstractPerTopic?: number;
  public gradingMethod!: string;
  public abstractSubmissionStartDate!: Date;
  public abstractSubmissionEndDate!: Date;
  public abstractSubmissionEnabled!: boolean;
  public paperSubmissionEnabled!: boolean;
  public abstractSubmissionAcceptedUserType?: string;
  public abstractDescriptionCharLimit?: number;
  public abstractSubmissionPageTitle?: string;
  public abstractSubmissionPageDescription?: string;
  public paperSubmissionPageTitle!: string;
  public paperSubmissionPageDescription!: string;
  public abstractSubmissionFormVisibleFields?: string;
  public abstractSubmissionFormMandatoryFields?: string;
  public abstractSubmissionNotificationBccAddress?: string;
  public paperSubmissionNotificationBccAddress?: string;
  public abstractSubmissionNotificationContent?: string;
  public paperSubmissionNotificationContent?: string;
  public abstractReviewDeadline!: Date; // New field added here
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviewConfigs(
  sequelize: Sequelize
): typeof AbstractReviewConfigs {
  AbstractReviewConfigs.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      reviewerPerAbstract: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      abstractPerSubmitter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      allowSameInstitution: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      abstractPerTopic: { type: DataTypes.INTEGER, allowNull: true },
      gradingMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "text",
      },
      abstractSubmissionStartDate: { type: DataTypes.DATE, allowNull: false },
      abstractSubmissionEndDate: { type: DataTypes.DATE, allowNull: false },
      abstractSubmissionEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      paperSubmissionEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      abstractSubmissionAcceptedUserType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      abstractDescriptionCharLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      abstractSubmissionPageTitle: { type: DataTypes.TEXT, allowNull: true },
      abstractSubmissionPageDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paperSubmissionPageTitle: { type: DataTypes.TEXT, allowNull: true },
      paperSubmissionPageDescription: { type: DataTypes.TEXT, allowNull: true },
      abstractSubmissionFormVisibleFields: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      abstractSubmissionFormMandatoryFields: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      abstractSubmissionNotificationBccAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paperSubmissionNotificationBccAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      abstractSubmissionNotificationContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paperSubmissionNotificationContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      abstractReviewDeadline: {
        type: DataTypes.DATE,
        allowNull: false, // The new field is not nullable
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviewConfigs",
    }
  );

  return AbstractReviewConfigs;
}
