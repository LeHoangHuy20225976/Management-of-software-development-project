'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RoomType.belongsTo(models.Hotel, { foreignKey: 'hotel_id' });
      RoomType.hasMany(models.Room, { foreignKey: 'type_id' });
      RoomType.hasOne(models.RoomPrice, { foreignKey: 'type_id' });
      // many to many relationship between RoomType and RoomService through ServicePossessing
      RoomType.belongsToMany(models.RoomService, {
        through: models.ServicePossessing,
        foreignKey: 'type_id',
        otherKey: 'service_id'
      });
    }
  }
  RoomType.init({
    type_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hotel_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    availability: DataTypes.BOOLEAN,
    max_guests: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RoomType',
    tableName: 'RoomType',
    freezeTableName: true,
    timestamps: true
  });
  return RoomType;
};