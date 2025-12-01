'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HotelFacilities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many to many relationship between HotelFacilities and Hotel through FacilitiesPossessing
      HotelFacilities.belongsToMany(models.Hotel, {
        through: models.FacilitiesPossessing,
        foreignKey: 'facility_id',
        otherKey: 'hotel_id'
      });
    }
  }
  HotelFacilities.init({
    facility_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HotelFacilities',
    tableName: 'HotelFacilities',
    freezeTableName: true
  });
  return HotelFacilities;
};