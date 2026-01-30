import { sequelize } from '../utilities/database';
import { DataTypes, Model } from 'sequelize';


interface DepartmentAttributes {
  deptAbbr: string;
  staffQuota: number;
  studentQuota: number;
};

class Department extends Model<DepartmentAttributes, DepartmentAttributes> implements DepartmentAttributes {
  deptAbbr: string;
  staffQuota: number;
  studentQuota: number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    deptAbbr: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    staffQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    studentQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Departments",
  }
);

export { Department, DepartmentAttributes };