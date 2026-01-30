import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface WebMenuAttributes {
  id: number;
  webId: string;
  secondLevel: string;
  title: string;
  pageUrl: string;
  newTab: boolean;
  createdBy: string;
  updatedBy: string;
};

interface WebMenusCreationAttributes extends Optional<WebMenuAttributes,
  "id" | "webId" | "secondLevel" | "title" | "pageUrl" | "newTab" |
  "createdBy" | "updatedBy"
> { }

class WebMenu extends Model<WebMenuAttributes, WebMenusCreationAttributes> implements WebMenuAttributes {
  id: number;
  webId: string;
  secondLevel: string;
  title: string;
  pageUrl: string;
  newTab: boolean;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebMenu.init(
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
    secondLevel: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    newTab: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    tableName: "WebMenus",
  }
);

export { WebMenu, WebMenuAttributes };