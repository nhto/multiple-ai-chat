import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { Event } from './event';
import { EventSession } from './eventSession';
import { Participant } from './participant';

// TODO: status = "Not Attended", "Attended"
interface AttendanceAttributes {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;
  status: string;
  updatedBy: string;
};

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, "id" | "sessionId"> { }

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;
  status: string;
  updatedBy: string;

  public readonly participant?: Participant;
  public readonly event?: Event;
  public readonly eventSession?: EventSession;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    participantId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    updatedBy: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Attendances",
  }
);

export { Attendance, AttendanceAttributes };