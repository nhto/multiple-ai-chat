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
import { MAX } from 'mssql';

// Attributes and creation attributes for EventFolders
interface EventFolderAttributes {
  id: number;
  eventId: string;
  folderName: string;
  folderDescription?: string;
  folderOrder?: number;
  folderUrl: string;
  isFolderPublic: boolean;
  accessRight?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  folderExpiryDate: string; //new field for folder expiry date
}

interface EventFolderCreationAttributes
  extends Optional<EventFolderAttributes, "id"> {}

class EventFolders
  extends Model<EventFolderAttributes, EventFolderCreationAttributes>
  implements EventFolderAttributes
{
  public id!: number;
  public eventId!: string;
  public folderName!: string;
  public folderDescription?: string;
  public folderOrder?: number;
  public folderUrl!: string;
  public isFolderPublic!: boolean;
  public accessRight?: string;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
  public folderExpiryDate!: string; //new field for folder expiry date

  // Association methods for EventFiles
  public getFiles!: HasManyGetAssociationsMixin<EventFiles>;
  public addFile!: HasManyAddAssociationMixin<EventFiles, number>;
  public hasFile!: HasManyHasAssociationMixin<EventFiles, number>;
  public countFiles!: HasManyCountAssociationsMixin;
  public createFile!: HasManyCreateAssociationMixin<EventFiles>;

  public readonly files?: EventFiles[];

  public static associations: {
    files: Association<EventFolders, EventFiles>;
  };
}

// Attributes and creation attributes for EventFiles
interface EventFileAttributes {
  id: number;
  folderId: number;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  s3FileName: string;
  showFile: boolean;
  isFileAccessible: boolean;
  fileOrder?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  fileDescription?: string;
}

interface EventFileCreationAttributes
  extends Optional<EventFileAttributes, "id"> {}

class EventFiles
  extends Model<EventFileAttributes, EventFileCreationAttributes>
  implements EventFileAttributes
{
  public id!: number;
  public folderId!: number;
  public fileName!: string;
  public fileSize!: string;
  public fileUrl!: string;
  public s3FileName!: string;
  public showFile!: boolean;
  public isFileAccessible!: boolean;
  public fileOrder?: number;
  public createdAt!: Date;
  public createdBy!: string;
  public updatedAt!: Date;
  public updatedBy!: string;
  public fileDescription?: string;
}

// Initializing EventFolders
EventFolders.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    eventId: { type: DataTypes.STRING(255), allowNull: false },
    folderName: { type: DataTypes.STRING(255), allowNull: false },
    folderDescription: { type: DataTypes.TEXT, allowNull: true },
    folderOrder: { type: DataTypes.INTEGER, allowNull: true },
    folderUrl: { type: DataTypes.TEXT, allowNull: false },
    isFolderPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    accessRight: { type: DataTypes.STRING(255), allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.STRING(30), allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    folderExpiryDate: { type: new DataTypes.STRING(MAX), allowNull: true },
  },
  {
    sequelize,
    tableName: "EventFolders",
  }
);

// Initializing EventFiles
EventFiles.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    folderId: { type: DataTypes.INTEGER, allowNull: false },
    fileName: { type: DataTypes.STRING(255), allowNull: false },
    fileSize: { type: DataTypes.STRING(255), allowNull: false },
    fileUrl: { type: DataTypes.TEXT, allowNull: false },
    s3FileName: { type: DataTypes.STRING(255), allowNull: false },
    showFile: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isFileAccessible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fileOrder: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.STRING(30), allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    updatedBy: { type: DataTypes.STRING(30), allowNull: false },
    fileDescription: { type: DataTypes.STRING(MAX), allowNull: true },
  },
  {
    sequelize,
    tableName: "EventFiles",
  }
);

// Define associations
EventFolders.hasMany(EventFiles, { foreignKey: "folderId", as: "files" });
EventFiles.belongsTo(EventFolders, { foreignKey: "folderId", as: "folder" });

export { EventFolders, EventFiles };
