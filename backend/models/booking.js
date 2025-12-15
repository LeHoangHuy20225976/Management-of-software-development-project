'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1 BOOKING belongs to 1 USER
      Booking.belongsTo(models.User, { foreignKey: 'user_id' });
      // 1 BOOKING belongs to 1 ROOM
      Booking.belongsTo(models.Room, { foreignKey: 'room_id' });
      // 1 BOOKING has many PAYMENTS
      Booking.hasMany(models.Payment, { foreignKey: 'booking_id' });
    }
  }
  Booking.init({
    booking_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    total_price: DataTypes.BIGINT,
    check_in_date: DataTypes.DATE,
    check_out_date: DataTypes.DATE,
    created_at: DataTypes.DATE,
    people: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Booking',
    freezeTableName: true
  });
  return Booking;
};