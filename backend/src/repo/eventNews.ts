/* tslint:disable:max-classes-per-file */

import { sequelize } from "../utilities/database";
import {
  Model,
  DataTypes,
  Optional,
  Association,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";

// Attributes and creation attributes for EventFolders
interface EventNewsGroupAttributes {
  id: number;
  eventId: string;
  title: string;
  description?: string;
  order?: number;
  isNewsGroupPublic?: boolean;
  accessRight?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface EventNewsGroupCreationAttributes
  extends Optional<EventNewsGroupAttributes, "id"> {}

class EventNewsGroups
  extends Model<EventNewsGroupAttributes, EventNewsGroupCreationAttributes>
  implements EventNewsGroupAttributes
{
  public id!: number;
  public eventId!: string;
  public title!: string;
  public description?: string;
  public order?: number;
  public isNewsGroupPublic?: boolean;
  public accessRight?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;

  // Association methods for EventFiles
  public getNews!: HasManyGetAssociationsMixin<EventNews>;
  public addNews!: HasManyAddAssociationMixin<EventNews, number>;
  public hasNews!: HasManyHasAssociationMixin<EventNews, number>;
  public countNews!: HasManyCountAssociationsMixin;
  public createNews!: HasManyCreateAssociationMixin<EventNews>;

  public readonly files?: EventNews[];

  public static associations: {
    files: Association<EventNewsGroups, EventNews>;
  };
}

// Attributes and creation attributes for EventNews
export interface EventNewsAttributes {
  id: number;
  newsGroupId: number;
  newsTitle: string;
  newsDate: string;
  newsUrl: string;
  newsNotes: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface EventNewsCreationAttributes
  extends Optional<EventNewsAttributes, "id"> {}

class EventNews
  extends Model<EventNewsAttributes, EventNewsCreationAttributes>
  implements EventNewsAttributes
{
  public id!: number;
  public newsGroupId!: number;
  public newsTitle!: string;
  public newsDate!: string;
  public newsUrl!: string;
  public newsNotes!: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
}

// Initializing EventNewsGroups
EventNewsGroups.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    eventId: { type: DataTypes.STRING(255), allowNull: false },
    title: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    order: { type: DataTypes.INTEGER, allowNull: true },
    isNewsGroupPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    accessRight: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.STRING(30), allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    updatedBy: { type: DataTypes.STRING(30), allowNull: false },
  },
  {
    sequelize,
    tableName: "EventNewsGroups",
    timestamps: true,
  }
);

// Initializing EventNews
EventNews.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    newsGroupId: { type: DataTypes.INTEGER, allowNull: false },
    newsTitle: { type: DataTypes.TEXT, allowNull: false },
    newsDate: { type: DataTypes.DATE, allowNull: false },
    newsUrl: { type: DataTypes.TEXT, allowNull: true },
    newsNotes: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.STRING(30), allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    updatedBy: { type: DataTypes.STRING(30), allowNull: false },
  },
  {
    sequelize,
    tableName: "EventNews",
    timestamps: true,
  }
);

// Define associations
EventNewsGroups.hasMany(EventNews, { foreignKey: "newsGroupId", as: "news" });
EventNews.belongsTo(EventNewsGroups, { foreignKey: "newsGroupId", as: "newsgroup" });

export { EventNewsGroups, EventNews };
