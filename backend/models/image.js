"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many to one relationship between Image and Hotel
      Image.belongsTo(models.Hotel, { foreignKey: "hotel_id" });
      // Many to one relationship between Image and Destination
      Image.belongsTo(models.Destination, { foreignKey: "destination_id" });
      // Many to one relationship between Image and Room
      Image.belongsTo(models.Room, { foreignKey: "room_id" });
    }
  }
  Image.init(
    {
      image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      destination_id: DataTypes.INTEGER,
      hotel_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
      image_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Image",
      tableName: "Image",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Image;
};
