import { sequelize } from "../utilities/database";
import { DataTypes, Model, Optional } from "sequelize";
// import { Roster } from './roster';
// import { DepartmentAttributes } from './department';
// import { UUID } from 'crypto';

interface EmailTemplateAttributes {
  id: string;
  eventId: string;
  name: string;
  from: string;
  bcc: string;
  subject: string;
  details: string;
  updatedBy: string;
}

interface EmailTemplateCreationAttributes
  extends Optional<EmailTemplateAttributes, "id"> { }

class EmailTemplate extends Model<EmailTemplateAttributes, EmailTemplateCreationAttributes> implements EmailTemplateAttributes {
  id: string;
  eventId: string;
  name: string;
  from: string;
  bcc: string;
  subject: string;
  details: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailTemplate.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    from: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bcc: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "EmailTemplates",
  }
);

export { EmailTemplate, EmailTemplateAttributes };