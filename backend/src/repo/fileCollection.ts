import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';

import { FileSubmission } from './fileSubmission';
import { FileSubmissionCharLimit } from '../models/model';
import { MAX } from 'mssql';

interface FileCollectionAttributes {
  id: string;
  eventId: string;
  submissionEnabled: boolean;
  acceptedUserType: string;
  description: string;
  customQuestions: string;
  visibleFields: string;
  mandatoryFields: string;
  abstractAltTitle: string;
  abstractFileType: string;
  abstractCharLimit: number;
  abstractStartDate: Date;
  abstractEndDate: Date;
  paperAltTitle: string;
  paperFileType: string;
  paperCharLimit: number;
  paperStartDate: Date;
  paperEndDate: Date;
  bccAbstract: string;
  emailTemplateAbstract: string;
  bccPaper: string;
  emailTemplatePaper: string;
  createdBy: string;
  updatedBy: string;
};

interface FileCollectionCreationAttributes extends Optional<FileCollectionAttributes,
  "id" | "eventId" | "submissionEnabled" | "acceptedUserType" |
  "description" | "customQuestions" | "visibleFields" |"mandatoryFields" |
  "abstractAltTitle" | "abstractFileType" | "abstractCharLimit" | "abstractStartDate" | "abstractEndDate" |
  "paperAltTitle" | "paperFileType" | "paperCharLimit" | "paperStartDate" | "paperEndDate"
> { }

class FileCollection extends Model<FileCollectionAttributes, FileCollectionCreationAttributes> implements FileCollectionAttributes {
  id: string;
  eventId: string;
  submissionEnabled: boolean;
  acceptedUserType: string;
  description: string;
  customQuestions: string;
  visibleFields: string;
  mandatoryFields: string;
  abstractAltTitle: string;
  abstractFileType: string;
  abstractCharLimit: number;
  abstractStartDate: Date;
  abstractEndDate: Date;
  paperAltTitle: string;
  paperFileType: string;
  paperCharLimit: number;
  paperStartDate: Date;
  paperEndDate: Date;
  bccAbstract: string;
  emailTemplateAbstract: string;
  bccPaper: string;
  emailTemplatePaper: string;
  createdBy: string;
  updatedBy: string;

  public readonly submissions?: FileSubmission[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FileCollection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    submissionEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acceptedUserType: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    customQuestions: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    visibleFields: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    mandatoryFields: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    abstractAltTitle: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    abstractFileType: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    abstractCharLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: FileSubmissionCharLimit
    },
    abstractStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    abstractEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paperAltTitle: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    paperFileType: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    paperCharLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: FileSubmissionCharLimit
    },
    paperStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paperEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bccAbstract: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    emailTemplateAbstract: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    bccPaper: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    emailTemplatePaper: {
      type: new DataTypes.STRING(MAX),
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
    tableName: "FileCollection",
  }
);

export { FileCollection, FileCollectionAttributes };