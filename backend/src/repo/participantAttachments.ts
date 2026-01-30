import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface ParticipantAttachmentsAttributes {
  id: string;
  eventId: string;
  participantId: string;
  fileName: string;
  s3Key: string;
  fileSize: string;
  createdBy: string;
  updatedBy: string;
};

interface ParticipantAttachmentsCreationAttributes extends Optional<ParticipantAttachmentsAttributes,
  "id" | "eventId" | "participantId" | "fileName" | "s3Key" |
  "fileSize" |"createdBy" | "updatedBy"
> { }

class ParticipantAttachments extends Model<ParticipantAttachmentsAttributes, ParticipantAttachmentsCreationAttributes> implements ParticipantAttachmentsAttributes {
  id: string;
  eventId: string;
  participantId: string;
  fileName: string;
  s3Key: string;
  fileSize: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ParticipantAttachments.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    participantId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(MAX),
      allowNull: false,
      defaultValue: false
    },
    s3Key: {
      type: DataTypes.STRING(MAX),
      allowNull: false,
      defaultValue: 0
    },
    fileSize: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
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
    tableName: "ParticipantAttachments",
  }
);

export { ParticipantAttachments, ParticipantAttachmentsAttributes };