import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';

interface ParticipantProfileAttributes {
  sub: string;
  netId: string;
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
  createdBy: string;
  updatedBy: string;
};

interface ParticipantProfileCreationAttributes extends Optional<ParticipantProfileAttributes,
  "sub" | "netId" | "title" | "firstname" | "lastname" | "email" |
  "yearOfGraduation" | "graduationProgram" | "graduationDept" |
  "position" | "institution" | "dept" | "address" | "country" |
  "officePhoneNumber" | "mobilePhoneNumber"
> { }

class ParticipantProfile extends Model<ParticipantProfileAttributes, ParticipantProfileCreationAttributes> implements ParticipantProfileAttributes {
  sub: string;
  netId: string;
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
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ParticipantProfile.init(
  {
    sub: {
      type: new DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    netId: {
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
      type: new DataTypes.STRING(255),
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
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    mobilePhoneNumber: {
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
    tableName: "ParticipantProfile",
  }
);

export { ParticipantProfile, ParticipantProfileAttributes };