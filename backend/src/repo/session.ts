import { sequelize } from '../utilities/database';
import { DataTypes, Model } from 'sequelize';

interface SessionAttributes {
  sid: string;
  expires: Date;
  netId: string;
  data: string;
};

class Session extends Model<SessionAttributes> implements SessionAttributes {
  sid: string;
  expires: Date;
  netId: string;
  data: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init(
  {
    sid: {
      field: 'id',
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    expires: {
      field: 'expiryDateTime',
      type: DataTypes.DATE,
      allowNull: false,
    },
    netId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Sessions",
  }
);

export { Session, SessionAttributes };