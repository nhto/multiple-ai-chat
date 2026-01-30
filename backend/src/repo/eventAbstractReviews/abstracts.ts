import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractAttributes {
  id: number;
  eventId: string;
  submitterId: number;
  topicId: number;
  title?: string;
  description?: string;
  reviewerNumber: number;
  isSubmitted: boolean;
  isReviewed: boolean;
  isReviewFinalized: boolean;
  finalResult: string;
  isReviewerNotified: boolean;
  isChairmanNotified: boolean;
  isSubmitterNotified: boolean;
  s3FileKey: string;
  fileName?: string;
  status?: string;
  submittedAt?: string;
  topic?: string;
  abstractDownloadUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  institution?: string;
  department?: string;
  position?: string;
  country?: string;
  submitter?: any;
  submitterTitle?: string;
  mobilePhone?: string;
  officePhone?: string;
  abstractFileUrl?: string;
  submitterEnrollment?: string;
  submitterNote?: string;
  isAdminScreeningPassed?: boolean;  // New field
  selectedPresentationMode?: string; // New field
  presentationMode?: string;
  isUnderDiscussionWithSubmitter?: boolean;
  reviewerIdsArray?: number[];
  reviewerNameString?: string;
  customQuestion0?: string;
  customQuestion1?: string;
  customQuestion2?: string;
  customQuestion3?: string;
  customQuestion4?: string;
  customQuestion5?: string;
  customQuestion6?: string;
  customQuestion7?: string;
  customQuestion8?: string;
  customQuestion9?: string;
  suggestedPresentationMode?: string;
  preScreeningComment: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractCreationAttributes extends Partial<AbstractAttributes> { }

class Abstracts extends Model<AbstractAttributes, AbstractCreationAttributes> {
  public id!: number;
  public eventId!: string;
  public submitterId!: number;
  public topicId!: number;
  public title?: string;
  public description?: string;
  public reviewerNumber!: number;
  public isSubmitted!: boolean;
  public isReviewed!: boolean;
  public isReviewFinalized!: boolean;
  public finalResult!: string;
  public isReviewerNotified!: boolean;
  public isChairmanNotified!: boolean;
  public isSubmitterNotified!: boolean;
  public s3FileKey!: string;
  public fileName?: string;
  public isAdminScreeningPassed?: boolean;  // New field
  public selectedPresentationMode?: string; // New field
  public preScreeningComment?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstracts(sequelize: Sequelize): typeof Abstracts {
  Abstracts.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      submitterId: { type: DataTypes.INTEGER, allowNull: false },
      topicId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.STRING, allowNull: true },
      reviewerNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isSubmitted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isReviewed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isReviewFinalized: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      finalResult: { type: DataTypes.STRING, allowNull: false },
      isReviewerNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isChairmanNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isSubmitterNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      s3FileKey: { type: DataTypes.STRING, allowNull: false },
      fileName: { type: DataTypes.STRING, allowNull: true },
      isAdminScreeningPassed: {
        type: DataTypes.BOOLEAN,
        allowNull: true, // Nullable field
        defaultValue: null, // Default value is null
      },
      selectedPresentationMode: {
        type: DataTypes.STRING,
        allowNull: true, // Nullable field
        defaultValue: "oral", // Default value is "oral"
      },
      preScreeningComment: { type: DataTypes.STRING, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "Abstracts",
    }
  );

  return Abstracts;
}
