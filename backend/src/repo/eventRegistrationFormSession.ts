import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';

interface EventRegistrationFormSessionAttributes {
  id: string;
  eventId: string;
  formId: string;
  sessionId: string;
  mandatory: boolean;
};

interface EventRegistrationFormSessionCreationAttributes extends Optional<EventRegistrationFormSessionAttributes, "id"> { }

class EventRegistrationFormSession extends Model<EventRegistrationFormSessionAttributes, EventRegistrationFormSessionCreationAttributes> implements EventRegistrationFormSessionAttributes {
  id: string;
  eventId: string;
  formId: string;
  sessionId: string;
  mandatory: boolean;
  //   public readonly participant?: Participant;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventRegistrationFormSession.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: { type: DataTypes.UUID, allowNull: false, },
    formId: { type: DataTypes.UUID, allowNull: false, },
    sessionId: { type: DataTypes.UUID, allowNull: true, },
    mandatory: { type: DataTypes.BOOLEAN, allowNull: true, },
  },
  {
    sequelize,
    tableName: "EventRegistrationFormSession",
  }
);

export { EventRegistrationFormSession, EventRegistrationFormSessionAttributes };