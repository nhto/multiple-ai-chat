import { sequelize } from '../utilities/database';
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, Optional } from 'sequelize';
import { Department } from './department';
import { Event } from './event';

interface RosterAttributes {
  eventId: number;
  deptAbbr: string;
};

class Roster extends Model<RosterAttributes, RosterAttributes> implements RosterAttributes {
  eventId: number;
  deptAbbr: string;

  public readonly event?: Event;
  public readonly department?: Department;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Roster.init(
  {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deptAbbr: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Rosters",
  }
);

export { Roster, RosterAttributes };