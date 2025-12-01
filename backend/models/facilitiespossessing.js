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
      // define association here
    }
  }
  FacilitiesPossessing.init({
    facility_id: DataTypes.INTEGER,
    hotel_id: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FacilitiesPossessing',
    tableName: 'FacilitiesPossessing',
    freezeTableName: true
  });
  return FacilitiesPossessing;
};