import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { Roster } from './roster';
import { DepartmentAttributes } from './department';
import { RoleUser } from './roleUser';

interface UserAttributes {
  netId: string,
  userType: string;
  userId: string;
  fullName: string,
  displayName: string,
  surname: string,
  givenName: string,
  deptAbbr: string,
  email: string,
  isTermOfUseAccepted?: boolean,
};

interface UserCreationAttributes extends Optional<UserAttributes, "fullName" | "displayName" | "surname" | "givenName" | "email"> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  netId: string;
  userType: string;
  userId: string;
  fullName: string;
  displayName: string;
  surname: string;
  givenName: string;
  deptAbbr: string;
  email: string;
  isTermOfUseAccepted?: boolean;

  public readonly roleUsers?: RoleUser[];
  public readonly rosters?: Roster[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    netId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    userType: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    userId: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    fullName: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    displayName: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    surname: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    givenName: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    deptAbbr: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    isTermOfUseAccepted:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "User",
  }
);

export { User, UserAttributes };