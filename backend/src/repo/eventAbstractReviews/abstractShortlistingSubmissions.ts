import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractShortlistingSubmissionAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  fileType: string;
  s3FileKey: string;
  fileName: string;
  abstractTitle?: string;
  userEmail?: string;
  abstractTopic?: string;
  paperDownloadUrl?: string;
  suggestedPresentationMode?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractShortlistingSubmissionCreationAttributes
  extends Partial<AbstractShortlistingSubmissionAttributes> {}

class AbstractShortlistingSubmissions extends Model<
  AbstractShortlistingSubmissionAttributes,
  AbstractShortlistingSubmissionCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public abstractId!: number;
  public fileType!: string;
  public s3FileKey!: string;
  public fileName!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractShortlistingSubmissions(
  sequelize: Sequelize
): typeof AbstractShortlistingSubmissions {
  AbstractShortlistingSubmissions.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      abstractId: { type: DataTypes.INTEGER, allowNull: false },
      fileType: { type: DataTypes.STRING, allowNull: false },
      s3FileKey: { type: DataTypes.STRING, allowNull: false },
      fileName: { type: DataTypes.STRING, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractShortlistingSubmissions",
    }
  );

  return AbstractShortlistingSubmissions;
}
