import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';

import { FileCollection } from './fileCollection';

interface FileSubmissionAttributes {
  id: string;
  collectionId: string;
  sub: string;
  netId: string;
  userId: string;
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  yearOfGraduation: string;
  graduationProgram: string;
  graduationDept: string;
  position: string;
  institution: string;
  dept: string;
  address: string;
  country: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;
  customQuestionsAns: string;
  abstractTitle: string;
  abstractDescription: string;
  abstractFileName: string;
  abstractUrl: string;
  abstractUpdateCount: number;
  abstractApprovalStatus: number;
  abstractApprovalUpdatedAt: Date;
  abstractApprovalUpdatedBy: string;
  paperTitle: string;
  paperDescription: string;
  paperFileName: string;
  paperUrl: string;
  paperUpdateCount: number;
  paperApprovalStatus: number;
  paperApprovalUpdatedAt: Date;
  paperApprovalUpdatedBy: string;
  createdBy: string;
  updatedBy: string;
};

interface FileSubmissionCreationAttributes extends Optional<FileSubmissionAttributes,
  "id" | "collectionId" | "sub" | "netId" | "userId" | "title" | "firstname" | "lastname" | "email" |
  "yearOfGraduation" | "graduationProgram" | "graduationDept" |
  "position" | "institution" | "dept" | "address" | "country" | "officePhoneNumber" | "mobilePhoneNumber" |
  "customQuestionsAns" |
  "abstractTitle" | "abstractDescription" | "abstractFileName" | "abstractUrl" | "abstractUpdateCount" |
  "abstractApprovalStatus" | "abstractApprovalUpdatedAt" | "abstractApprovalUpdatedBy" |
  "paperTitle" | "paperDescription" | "paperFileName" | "paperUrl" | "paperUpdateCount" |
  "paperApprovalStatus" | "paperApprovalUpdatedAt" | "paperApprovalUpdatedBy"
> { }

class FileSubmission extends Model<FileSubmissionAttributes, FileSubmissionCreationAttributes> implements FileSubmissionAttributes {
  id: string;
  collectionId: string;
  sub: string;
  netId: string;
  userId: string;
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  yearOfGraduation: string;
  graduationProgram: string;
  graduationDept: string;
  position: string;
  institution: string;
  dept: string;
  address: string;
  country: string;
  officePhoneNumber: string;
  mobilePhoneNumber: string;
  customQuestionsAns: string;
  abstractTitle: string;
  abstractDescription: string;
  abstractFileName: string;
  abstractUrl: string;
  abstractUpdateCount: number;
  abstractApprovalStatus: number;
  abstractApprovalUpdatedAt: Date;
  abstractApprovalUpdatedBy: string;
  paperTitle: string;
  paperDescription: string;
  paperFileName: string;
  paperUrl: string;
  paperUpdateCount: number;
  paperApprovalStatus: number;
  paperApprovalUpdatedAt: Date;
  paperApprovalUpdatedBy: string;
  createdBy: string;
  updatedBy: string;

  public readonly collection?: FileCollection;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FileSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    collectionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sub: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    netId: {
      type: new DataTypes.STRING(30),
      allowNull: false,
    },
    userId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    title: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    firstname: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    lastname: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    yearOfGraduation: {
      type: new DataTypes.STRING(4),
      allowNull: true,
    },
    graduationProgram: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    graduationDept: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    position: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    institution: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    dept: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    address: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    country: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    officePhoneNumber: {
      type: new DataTypes.STRING(30),
      allowNull: true,
    },
    mobilePhoneNumber: {
      type: new DataTypes.STRING(30),
      allowNull: true,
    },
    customQuestionsAns: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    abstractTitle: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    abstractDescription: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    abstractFileName: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    abstractUrl: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    abstractUpdateCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    abstractApprovalStatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    abstractApprovalUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    abstractApprovalUpdatedBy: {
      type: new DataTypes.STRING(30),
      allowNull: true,
    },
    paperTitle: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    paperDescription: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    paperFileName: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    paperUrl: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    paperUpdateCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    paperApprovalStatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    paperApprovalUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paperApprovalUpdatedBy: {
      type: new DataTypes.STRING(30),
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
    tableName: "FileSubmission",
  }
);

export { FileSubmission, FileSubmissionAttributes };