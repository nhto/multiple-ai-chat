import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';


interface AppConfigAttributes {
  configId: string;
  value: string;
  createdBy: string;
  updatedBy: string;
};

interface AppConfigsCreationAttributes extends Optional<AppConfigAttributes,
  "configId" | "value" | "createdBy" | "updatedBy"
> { }

class AppConfig extends Model<AppConfigAttributes, AppConfigsCreationAttributes> implements AppConfigAttributes {
  configId: string;
  value: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppConfig.init(
  {
    configId: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    value: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    createdBy: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    updatedBy: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "AppConfig",
  }
);

export { AppConfig, AppConfigAttributes };