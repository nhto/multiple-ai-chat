import { sequelize } from "../utilities/database";
import { DataTypes, Model, Optional } from "sequelize";
import { RoleUser } from "./roleUser";
// import { Roster } from './roster';
// import { DepartmentAttributes } from './department';
// import { UUID } from 'crypto';

interface EventAttributes {
  id: string;
  topic: string;
  subtopic: string;
  start: Date;
  end: Date;
  remark: string;
  eventMode: string;
  quota: number;
  waitingListQuota: number;
  used: number;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactDept: string;
  banner: Buffer;
}

interface EventCreationAttributes
  extends Optional<EventAttributes, "id" | "banner"> { }

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes {
  id: string;
  topic: string;
  subtopic: string;
  start: Date;
  end: Date;
  remark: string;
  eventMode: string;
  quota: number;
  waitingListQuota: number;
  used: number;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  contactDept: string;
  banner: Buffer;

  public readonly roles?: RoleUser[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    topic: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subtopic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventMode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quota: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    waitingListQuota: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    used: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    contactName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactEmail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactPhoneNumber: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactDept: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    banner: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Events",
  }
);

export { Event, EventAttributes };