import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { Role } from './role';
import { User } from './user';

interface RoleUserAttributes {
  id: number;
  roleLabel: string;
  netId: string;
  eventId: string;
};

interface RoleUserCreationAttributes extends Optional<RoleUserAttributes, "id" | "eventId"> { }

class RoleUser extends Model<RoleUserAttributes, RoleUserCreationAttributes> implements RoleUserAttributes {
  id: number;
  roleLabel: string;
  netId: string;
  eventId: string;

  public readonly role?: Role;
  public readonly user?: User;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoleUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleLabel: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    netId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    eventId: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "RoleUser",
  }
);

export { RoleUser, RoleUserAttributes };