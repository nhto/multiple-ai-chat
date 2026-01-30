import { Sequelize, DataTypes, Model } from "sequelize";

interface AbstractReviewEmailDeliveryLogAttributes {
  id: number;
  eventId: string;
  abstractId: number;
  emailFrom: string;
  emailTo: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  templateId?: number; // Added new field
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractReviewEmailDeliveryLogCreationAttributes
  extends Partial<AbstractReviewEmailDeliveryLogAttributes> {}

class AbstractReviewEmailDeliveryLog extends Model<
  AbstractReviewEmailDeliveryLogAttributes,
  AbstractReviewEmailDeliveryLogCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public abstractId!: number;
  public emailFrom!: string;
  public emailTo!: string;
  public cc?: string;
  public bcc?: string;
  public subject!: string;
  public content!: string;
  public templateId?: number; // Added new field
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractReviewEmailDeliveryLog(
  sequelize: Sequelize
): typeof AbstractReviewEmailDeliveryLog {
  AbstractReviewEmailDeliveryLog.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING, allowNull: false },
      abstractId: { type: DataTypes.INTEGER, allowNull: false },
      emailFrom: { type: DataTypes.STRING, allowNull: false },
      emailTo: { type: DataTypes.STRING, allowNull: false },
      cc: { type: DataTypes.STRING, allowNull: true },
      bcc: { type: DataTypes.STRING, allowNull: true },
      subject: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      templateId: { type: DataTypes.INTEGER, allowNull: true }, // Added new field
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractReviewEmailDeliveryLog",
      timestamps: true,
      updatedAt: "updatedAt",
      createdAt: "createdAt",
    }
  );

  return AbstractReviewEmailDeliveryLog;
}
