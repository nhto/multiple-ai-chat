import { sequelize } from "../utilities/database";
import { DataTypes, Model, Optional } from "sequelize";
// import { Roster } from './roster';
// import { DepartmentAttributes } from './department';
// import { UUID } from 'crypto';

interface EventSessionAttributes {
  id: string;
  eventId: string;
  venue: string;
  quota: number;
  used: number;
  details: string;
  // needPayment: boolean;
  // price: number;
  // price_eb: number;
  allowWalkIn: boolean;
  from: Date;
  to: Date;
  disabled: boolean;
}

interface EventSessionCreationAttributes
  extends Optional<EventSessionAttributes, "id"> { }

class EventSession
  extends Model<EventSessionAttributes, EventSessionCreationAttributes>
  implements EventSessionAttributes {
  id: string;
  eventId: string;
  venue: string;
  quota: number;
  used: number;
  details: string;
  // needPayment: boolean;
  // price: number;
  // price_eb: number;
  allowWalkIn: boolean;
  from: Date;
  to: Date;
  disabled: boolean;

  // public readonly venue?: Venue;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventSession.init(
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
    venue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quota: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    used: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // needPayment: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    // },
    // price: {
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: false,
    // },
    // price_eb: {
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: false,
    // },
    allowWalkIn: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "EventSession",
  }
);

export { EventSession, EventSessionAttributes };