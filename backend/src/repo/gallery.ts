/* tslint:disable:max-classes-per-file */

import { sequelize } from '../utilities/database';
import {
    Model,
    DataTypes,
    Association,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    Optional,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin
  } from 'sequelize';
import { MAX } from 'mssql';
  
  // These are all the attributes in the User model
  interface EventAlbumAttributes {
    id: string;
    eventId: string;
    albumName: string;
    albumDate: string; //Date;
    albumDescription?: string; // Optional field
    albumOrder?: number; // Optional field
    isAlbumPublic: boolean;
    accessRight?: string; // Optional field
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    albumExpiryDate: string; //new field for album expiry date
  }
  
  interface EventAlbumCreationAttributes
    extends Optional<EventAlbumAttributes, 'id'> {}
  
  class EventAlbums extends Model<EventAlbumAttributes, EventAlbumCreationAttributes>
    implements EventAlbumAttributes {
    public id!: string; // Note that the `null assertion` `!` is required in strict mode.
    public eventId!: string;
    public albumName!: string;
    public albumDate!: string;
    public albumDescription?: string;
    public albumOrder?: number;
    public isAlbumPublic!: boolean;
    public accessRight?: string;
    public createdBy!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public updatedBy!: string;
    public albumExpiryDate!: string; //new field for album expiry date
  
    // // timestamps!
    // public readonly createdAt!: Date;
    // public readonly updatedAt!: Date;
  
    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    public getPhotos!: HasManyGetAssociationsMixin<EventPhotos>; // Note the null assertions!
    public addPhoto!: HasManyAddAssociationMixin<EventPhotos, number>;
    public hasPhoto!: HasManyHasAssociationMixin<EventPhotos, number>;
    public countPhotos!: HasManyCountAssociationsMixin;
    public createPhoto!: HasManyCreateAssociationMixin<EventPhotos>;
  
    public readonly photos?: EventPhotos[]; // Note this is optional since it's only populated when explicitly requested in code
  
    public static associations: {
      photos: Association<EventAlbums, EventPhotos>;
    };
  }
  
  interface EventPhotoAttributes {
    id: string;
    albumId: number;
    s3PhotoFileName: string;
    isCoverPhoto: boolean;
    photoOrder?: number; // Optional field
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    photoDescription?: string; //new Added field for description
  }
  
  interface EventPhotoCreationAttributes
    extends Optional<EventPhotoAttributes, 'id'> {}
  
  class EventPhotos extends Model<EventPhotoAttributes, EventPhotoCreationAttributes>
    implements EventPhotoAttributes {
    public id!: string;
    public albumId!: number;
    public s3PhotoFileName!: string;
    public isCoverPhoto: boolean;
    public photoOrder?: number;
    public createdBy!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public updatedBy!: string;
    public photoDescription?: string;
  
    // // timestamps!
    // public readonly createdAt!: Date;
    // public readonly updatedAt!: Date;
  
    // You can declare methods for associations here
    public getAlbum!: BelongsToGetAssociationMixin<EventAlbums>;
    public setAlbum!: BelongsToSetAssociationMixin<EventAlbums, number>;
    public createAlbum!: BelongsToCreateAssociationMixin<EventAlbums>;
  
    public static associations: {
      album: Association<EventPhotos, EventAlbums>;
    };
  }

  EventAlbums.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      eventId: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      albumName: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      albumDate: {
        // type: DataTypes.DATE,
        type: new DataTypes.STRING(MAX),
        allowNull: false,
      },
      albumDescription: {
        type: new DataTypes.STRING(255),
        allowNull: true,
      },
      albumOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isAlbumPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      accessRight: {
        type: new DataTypes.STRING(128),
        allowNull: true,
      },
      createdBy: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedBy: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      albumExpiryDate: {
        type: new DataTypes.STRING(MAX),
        allowNull: true,
      },
  },
  {
    tableName: 'EventAlbums',
    sequelize, // passing the `sequelize` instance is required
  },
);

EventPhotos.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    albumId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    s3PhotoFileName: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    isCoverPhoto: {
      type: new DataTypes.STRING(MAX),
      allowNull: false,
    },
    photoOrder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedBy: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    photoDescription: {
      type: new DataTypes.STRING(MAX),
      allowNull: true,
    },
  },
  {
    tableName: 'EventPhotos',
    sequelize, // passing the `sequelize` instance is required
  },
);

// Associations
EventAlbums.hasMany(EventPhotos, {
  sourceKey: 'id',
  foreignKey: 'albumId',
  as: 'photos', // This 'as' is what allows you to refer to album.photos
});

EventPhotos.belongsTo(EventAlbums, {
  foreignKey: 'albumId',
  targetKey: 'id',
  as: 'album', // This 'as' is what allows you to refer to photo.album
});

// Export the models
export { EventAlbums, EventPhotos };

  

