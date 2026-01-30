import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface WebAttributes {
  id: string;
  eventId: string;
  eventUrl: string;
  isPreview: boolean;
  previewUUID: string;
  isPublished: boolean;
  webTitle: string;
  polyUHeader: string;
  customizedHeader: string;
  menu: string;
  content: string;
  footer: string;
  jsString: string;
  defaultGtag: string;
  gtagString: string;
  createdBy: string;
  updatedBy: string;
};

interface WebsCreationAttributes extends Optional<WebAttributes,
  "id" | "eventId" | "eventUrl" | "isPreview" | "previewUUID" | "isPublished" |
  "webTitle" | "polyUHeader" | "customizedHeader" | "menu" | "content" | "footer" |
  "jsString" | "defaultGtag" | "gtagString" | "createdBy" | "updatedBy"
> { }

class Web extends Model<WebAttributes, WebsCreationAttributes> implements WebAttributes {
  id: string;
  eventId: string;
  eventUrl: string;
  isPreview: boolean;
  previewUUID: string;
  isPublished: boolean;
  webTitle: string;
  polyUHeader: string;
  customizedHeader: string;
  menu: string;
  content: string;
  footer: string;
  jsString: string;
  defaultGtag: string;
  gtagString: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Web.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    eventUrl: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    isPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      primaryKey: true,
    },
    previewUUID: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    webTitle: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    polyUHeader: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    customizedHeader: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    menu: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    content: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    footer: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    jsString: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    defaultGtag: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    gtagString: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    createdBy: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    updatedBy: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Webs",
  }
);

export { Web, WebAttributes };