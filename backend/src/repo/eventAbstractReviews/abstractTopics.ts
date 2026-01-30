import { Sequelize, DataTypes, Model } from "sequelize";
import { MAX } from "mssql";

interface AbstractTopicAttributes {
  id: number;
  eventId: string;
  topic: string;
  enable: boolean;
  title?: string;
  description?: string; // New field added
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface AbstractTopicCreationAttributes
  extends Partial<AbstractTopicAttributes> {}

class AbstractTopics extends Model<
  AbstractTopicAttributes,
  AbstractTopicCreationAttributes
> {
  public id!: number;
  public eventId!: string;
  public topic!: string;
  public enable!: boolean;
  public description?: string; // New field added
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

export function initAbstractTopics(
  sequelize: Sequelize
): typeof AbstractTopics {
  AbstractTopics.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      eventId: { type: DataTypes.STRING(MAX), allowNull: false },
      topic: { type: DataTypes.STRING(MAX), allowNull: false },
      enable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      description: {
        type: DataTypes.TEXT, // Use TEXT data type for long text
        allowNull: true, // Nullable field
        defaultValue: null, // Default value is null
      }, // New field added
      createdAt: { type: DataTypes.DATE, allowNull: false },
      createdBy: { type: DataTypes.STRING(30), allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    },
    {
      sequelize,
      tableName: "AbstractTopics",
    }
  );

  return AbstractTopics;
}
