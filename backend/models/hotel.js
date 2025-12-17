'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1 HOTEL belongs to 1 USER (hotel owner)
      Hotel.belongsTo(models.User, { foreignKey: 'hotel_owner' });
      // 1 HOTEL has many ROOM_TYPE
      Hotel.hasMany(models.RoomType, { foreignKey: 'hotel_id' });
      // relationship many and many with  Hotel - Facility through FacilitiesPossessing
      Hotel.belongsToMany(models.HotelFacilities, { through: models.FacilitiesPossessing, foreignKey: 'hotel_id', otherKey: 'facility_id' });
      // 1 HOTEL has many IMAGES
      Hotel.hasMany(models.Image, { foreignKey: 'hotel_id' });
      // 1 HOTEL has many REVIEWS
      Hotel.hasMany(models.Review, { foreignKey: 'hotel_id' });
      // 1 HOTEL has many LOVING_LIST
      Hotel.hasMany(models.LovingList, { foreignKey: 'hotel_id' });
    }
  }
  Hotel.init({
    hotel_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hotel_owner: DataTypes.INTEGER,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    status: DataTypes.INTEGER,
    rating: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    latitude: DataTypes.DOUBLE,
    description: DataTypes.TEXT,
    contact_phone: DataTypes.STRING,
    thumbnail: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Hotel',
    tableName: 'Hotel',
    freezeTableName: true
  });
  return Hotel;
};
