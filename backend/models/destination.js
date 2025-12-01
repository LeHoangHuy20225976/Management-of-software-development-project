'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Destination extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Destination.hasMany(models.Image, { foreignKey: 'destination_id' });
      Destination.hasMany(models.Review, { foreignKey: 'destination_id' });
      Destination.hasMany(models.LovingList, { foreignKey: 'destination_id' });
    }
  }
  Destination.init({
    destination_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    location: DataTypes.STRING,
    transportation: DataTypes.STRING,
    entry_fee: DataTypes.BIGINT,
    description: DataTypes.TEXT,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    type: DataTypes.STRING,
    thumbnail: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Destination',
    tableName: 'Destination',
    freezeTableName: true
  });
  return Destination;
};