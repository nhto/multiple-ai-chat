import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { Participant } from './participant';

interface ParticipantSessionAttributes {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;
};

interface ParticipantSessionCreationAttributes extends Optional<ParticipantSessionAttributes, "id"> { }

class ParticipantSession extends Model<ParticipantSessionAttributes, ParticipantSessionCreationAttributes> implements ParticipantSessionAttributes {
  id: string;
  eventId: string;
  sessionId: string;
  participantId: string;

  public readonly participant?: Participant;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ParticipantSession.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    eventId: { type: DataTypes.UUID, allowNull: false, },
    sessionId: { type: DataTypes.UUID, allowNull: true, },
    participantId: { type: DataTypes.UUID, allowNull: false, },
  },
  {
    sequelize,
    tableName: "ParticipantSession",
  }
);

export { ParticipantSession, ParticipantSessionAttributes };