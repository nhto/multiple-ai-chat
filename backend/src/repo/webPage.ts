import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface WebPageAttributes {
  id: string;
  webId: string;
  isRedirectUrl: boolean;
  displayPosition: number;
  Page_Url: string;
  Page_Title: string;
  Page_Banner: string;
  Page_Banner_Url: string;
  Page_Content: string;
  Page_Content_s3: string;
  createdBy: string;
  updatedBy: string;
};

interface WebPagesCreationAttributes extends Optional<WebPageAttributes,
  "id" | "webId" | "isRedirectUrl" | "displayPosition" |
  "Page_Url" | "Page_Title" | "Page_Banner" | "Page_Banner_Url" | "Page_Content" | "Page_Content_s3" |
  "createdBy" | "updatedBy"
> { }

class WebPage extends Model<WebPageAttributes, WebPagesCreationAttributes> implements WebPageAttributes {
  id: string;
  webId: string;
  isRedirectUrl: boolean;
  displayPosition: number;
  Page_Url: string;
  Page_Title: string;
  Page_Banner: string;
  Page_Banner_Url: string;
  Page_Content: string;
  Page_Content_s3: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebPage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    webId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isRedirectUrl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    displayPosition: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    Page_Url: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    Page_Title: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    Page_Banner: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    Page_Banner_Url: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    Page_Content: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    Page_Content_s3: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    createdBy: {
      type: new DataTypes.STRING(30),
      allowNull: false,
    },
    updatedBy: {
      type: new DataTypes.STRING(30),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "WebPages",
  }
);

export { WebPage, WebPageAttributes };