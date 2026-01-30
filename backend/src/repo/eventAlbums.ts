import { sequelize } from '../utilities/database';
import { DataTypes, Model, Optional } from 'sequelize';
import { MAX } from 'mssql';

interface EventAlbumsAttributes {
  id: string;
  eventId: string;
  albumName: string;
  albumDate: string;
  albumDescription: string;
  albumOrder: string;
  isAlbumPublic: boolean;
  accessRight: string;
  createdBy: string;
  updatedBy: string;
};

interface EventAlbumsCreationAttributes extends Optional<EventAlbumsAttributes,
  "id" | "eventId" | "albumName" | "albumDate" |
  "albumDescription" | "albumOrder" | "isAlbumPublic" |"accessRight" 
> { }

class EventAlbums extends Model<EventAlbumsAttributes, EventAlbumsCreationAttributes> implements EventAlbumsAttributes {
  id: string;
  eventId: string;
  albumName: string;
  albumDate: string;
  albumDescription: string;
  albumOrder: string;
  isAlbumPublic: boolean;
  accessRight: string;
  createdBy: string;
  updatedBy: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventAlbums.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      // unique: true,
    },
    albumName: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    albumDate: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    albumDescription: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
    albumOrder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAlbumPublic: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
      defaultValue: true,
    },
    accessRight: {
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
    tableName: "EventAlbums",
  }
);

export { EventAlbums, EventAlbumsAttributes };