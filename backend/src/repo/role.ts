import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { User } from './user';
import { RoleUser } from './roleUser';

interface RoleAttributes {
  roleLabel: string;
};

class Role extends Model<RoleAttributes, RoleAttributes> implements RoleAttributes {
  roleLabel: string;

  public readonly roleUsers?: RoleUser[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    roleLabel: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "Role",
  }
);

export { Role, RoleAttributes };