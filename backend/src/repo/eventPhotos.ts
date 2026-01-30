import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { MAX } from 'mssql';

interface EventPhotosAttributes {
  id: string;
  albumId: string;
  s3PhotoFileName: string;
  isCoverPhoto: boolean;
  photoOrder: string;
  createdBy: string;
  updatedBy: string;
};

interface EventPhotosCreationAttributes extends Optional<EventPhotosAttributes,
  "id" | "albumId" | "s3PhotoFileName" | "isCoverPhoto" |
  "photoOrder" | "createdBy" | "updatedBy" 
> { }

class EventPhotos extends Model<EventPhotosAttributes, EventPhotosCreationAttributes> implements EventPhotosAttributes {
  id: string;
  albumId: string;
  s3PhotoFileName: string;
  isCoverPhoto: boolean;
  photoOrder: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  photoDescription: string;
}

EventPhotos.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    albumId: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    s3PhotoFileName: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    isCoverPhoto: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    photoOrder: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
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
    tableName: "EventPhotos",
  }
);

export { EventPhotos, EventPhotosAttributes };