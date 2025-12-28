'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FacilitiesPossessing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // FacilitiesPossessing belongs to HotelFacilities
      FacilitiesPossessing.belongsTo(models.HotelFacilities, {
        foreignKey: 'facility_id',
        as: 'HotelFacility'
      });
      // FacilitiesPossessing belongs to Hotel
      FacilitiesPossessing.belongsTo(models.Hotel, {
        foreignKey: 'hotel_id'
      });
    }
  }
  FacilitiesPossessing.init({
    facility_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FacilitiesPossessing',
    tableName: 'FacilitiesPossessing',
    freezeTableName: true
  });
  return FacilitiesPossessing;
};