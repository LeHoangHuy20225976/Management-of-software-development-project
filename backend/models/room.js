'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Room.belongsTo(models.RoomType, { foreignKey: 'type_id' });
      // One to many relationship between Room and Booking
      Room.hasMany(models.Booking, { foreignKey: 'room_id' });
      // One to many relationship between Room and Image
      Room.hasMany(models.Image, { foreignKey: 'room_id' });
      // One to many relationship between Room and RoomLog
      Room.hasMany(models.RoomLog, { foreignKey: 'room_id' });
      Room.hasMany(models.Review, { foreignKey: 'room_id' }); // reviews for this room
    }
  }
  Room.init({
    room_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    location: DataTypes.STRING,
    status: DataTypes.INTEGER,
    estimated_available_time: DataTypes.DATE,
    number_of_single_beds: DataTypes.INTEGER,
    number_of_double_beds: DataTypes.INTEGER,
    room_view: DataTypes.STRING,
    room_size: DataTypes.DOUBLE,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Room',
    freezeTableName: true
  });
  return Room;
};