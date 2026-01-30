import { MAX } from 'mssql';
import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface RegistrationEmailDeliveryLogAttributes {
  id: number;
  eventId: string;
  templateId: string;
  emailFrom: string;
  emailTo: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  createdBy: string;
  updatedBy: string;
};

interface RegistrationEmailDeliveryLogCreationAttributes extends Optional<RegistrationEmailDeliveryLogAttributes,
  "id" | "eventId" | "templateId" | "emailFrom" |
  "emailTo" | "cc" | "bcc" | "subject" | "content" |
  "createdBy" | "updatedBy"
> { }

class RegistrationEmailDeliveryLog extends Model<RegistrationEmailDeliveryLogAttributes, RegistrationEmailDeliveryLogCreationAttributes> implements RegistrationEmailDeliveryLogAttributes {
  id: number;
  eventId: string;
  templateId: string;
  emailFrom: string;
  emailTo: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RegistrationEmailDeliveryLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    eventId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    templateId: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    emailFrom: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    emailTo: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    cc: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    bcc: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    subject: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    content: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
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
    tableName: "RegistrationEmailDeliveryLog",
  }
);

export { RegistrationEmailDeliveryLog, RegistrationEmailDeliveryLogAttributes };