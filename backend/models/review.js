"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: "user_id" });
      Review.belongsTo(models.Destination, { foreignKey: "destination_id" }); // may be NULL
      Review.belongsTo(models.Hotel, { foreignKey: "hotel_id" }); // may be NULL
      Review.belongsTo(models.Room, { foreignKey: "room_id" }); // may be NULL
    }
  }
  Review.init(
    {
      review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      destination_id: DataTypes.INTEGER,
      hotel_id: DataTypes.INTEGER,
      room_id: DataTypes.INTEGER,
      rating: DataTypes.INTEGER,
      comment: DataTypes.TEXT,
      date_created: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Review",
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Review;
};
